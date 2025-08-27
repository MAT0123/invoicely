import { sendEmail } from '@/app/lib/email';
import { InvoiceData } from '@/app/types/invoiceTypes';
import { NextRequest, NextResponse } from 'next/server';
import admin from "firebase-admin";
import winston from 'winston'
import WinstonCloudwatch, * as WinstonCloudWatch from 'winston-cloudwatch';
import { renderToBuffer, renderToFile } from '@react-pdf/renderer';
import { InvoicePDF } from '@/app/components/InvoiceTemplate';
import React from 'react';
import { randomUUID } from 'crypto';

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        }),
        databaseURL: "invoicely-f9dec.firebasestorage.app"
    });
}


const logger = winston.createLogger({
    level: 'verbose',
    format: winston.format.json(),
    defaultMeta: { service: 'cron-job-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ],
});

//if (process.env.NODE_ENV == 'production') {
logger.add(new WinstonCloudwatch({
    awsOptions: {
        credentials: {
            accessKeyId: process.env.AWS_CLOUDWATCH_ACCESS || "",
            secretAccessKey: process.env.AWS_CLOUDWATCH_SECRET || ""
        },
        region: process.env.AWS_REGION || "us-east-2"
    },
    logGroupName: 'invoicely',
    logStreamName: randomUUID(),
    level: 'verbose'
}))
//}
const db = admin.firestore()

export type InvoiceDataPlusUserId = InvoiceData & { userId: string }

export async function POST(request: NextRequest) {

    if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_API_KEY}`) {
        logger.verbose("Unauthorized attempt ")

        return NextResponse.json("Not Authorized", { status: 400 })
    }

    // sendEmail("matthewaureliustjoa@gmail.com", "Due date passed", "Yo", [
    //     {
    //         filename: `invoice-.pdf`,
    //         content: Buffer.from(""),
    //         contentType: 'application/pdf'
    //     }
    // ])

    try {
        const today = new Date()
        // const allExpiration = await getDocs(collection(db, 'users'))
        const allExpiration = await db.collection("users").get()
        let allInvoices: Array<InvoiceDataPlusUserId> = [];
        // allExpiration.forEach(async (res) => {
        //     const id = res.id
        //     const snapshot = await db.doc(id).collection("invoices").get()
        //     snapshot.docs.forEach((invoiceDoc) => {
        //         logger.verbose(invoiceDoc.data())

        //         allInvoices.push({
        //             ...invoiceDoc.data() as InvoiceData,
        //             userId: id
        //         });
        //     });
        // })
        for (const invoices of allExpiration.docs) {
            const id = invoices.id
            const snapshot = await db.doc(id).collection("invoices").get()
            snapshot.docs.forEach((invoiceDoc) => {
                logger.verbose(invoiceDoc.data())

                allInvoices.push({
                    ...invoiceDoc.data() as InvoiceData,
                    userId: id
                });
            });
        }
        // for (const users of allExpiration) {
        //     const userId = users.id
        //     const userInvoicesSnapshot = db.

        //     userInvoicesSnapshot.docs.forEach((invoiceDoc) => {
        //         allInvoices.push({
        //             ...invoiceDoc.data() as InvoiceData,
        //             userId: userId // Track which user this invoice belongs to
        //         });
        //     });

        // }
        // userInvoicesSnapshot?.docs.map((e) => {
        //     allInvoices.push(e.data() as InvoiceData);
        // })
        const emailPromise = allInvoices.map(async (e) => {
            const status = e.status
            const dueDate = new Date(e.dueDate)
            if (dueDate < today && status == "sent") {

                //const htmlPDF = generateInvoiceHTML(e)
                // const browser = await puppeteer.launch({
                //     headless: true,
                //     args: ['--no-sandbox', '--disable-setuid-sandbox']
                // });
                // const page = await browser.newPage();
                // await page.setContent(htmlPDF, { waitUntil: 'networkidle0' });
                // const pdfBuffer = await page.pdf({
                //     format: 'A4',
                //     printBackground: true,`
                //     margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
                // });
                // await browser.close();
                const { userId, ...invoidPdf } = e;


                const pdf = await renderToBuffer(<InvoicePDF invoice={invoidPdf} />)
                await db.doc(e.userId).collection("invoices").doc(e.invoiceNumber).update({
                    status: "overdue"
                });
                await sendEmail(e.clientEmail, "Due date passed", `Invoice number ${e.invoiceNumber} has not been paid yet`, [
                    {
                        filename: `invoice-${e.invoiceNumber}.pdf`,
                        // content: Buffer.from(pdfBuffer),
                        content: Buffer.from(pdf),
                        contentType: 'application/pdf'
                    }
                ])
            }
        })
        const results = await Promise.allSettled(emailPromise)
        const data = { message: 'Cron job executed successfully', timestamp: new Date() };

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error in GET /api/cron-jobs:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        error: 'Method not allowed. Use POST.'
    }, { status: 405 });
}

