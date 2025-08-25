import { sendEmail } from '@/app/lib/email';
import { InvoiceData } from '@/app/types/invoiceTypes';
import { collection, getDocs } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { generateInvoiceHTML } from './GenerateHtmlPDFTemplate';
import * as admin from "firebase-admin";

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    })
});
const db = admin.firestore()
export async function POST(request: NextRequest) {

    if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_API_KEY}`) {
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
        let allInvoices: Array<InvoiceData & { userId: string }> = [];
        allExpiration.forEach(async (res) => {
            const id = res.id
            const snapshot = await db.doc(id).collection("invoices").get()
            snapshot.docs.forEach((invoiceDoc) => {
                allInvoices.push({
                    ...invoiceDoc.data() as InvoiceData,
                    userId: id
                });
            });
        })
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
            const dueDate = new Date(e.dueDate)
            if (dueDate < today) {

                const htmlPDF = generateInvoiceHTML(e)
                // const browser = await puppeteer.launch({
                //     headless: true,
                //     args: ['--no-sandbox', '--disable-setuid-sandbox']
                // });
                // const page = await browser.newPage();
                // await page.setContent(htmlPDF, { waitUntil: 'networkidle0' });
                // const pdfBuffer = await page.pdf({
                //     format: 'A4',
                //     printBackground: true,
                //     margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
                // });
                // await browser.close();

                await sendEmail(e.clientEmail, "Due date passed", `Invoice number ${e.invoiceNumber} has not been paid yet`, [
                    {
                        filename: `invoice-${e.invoiceNumber}.pdf`,
                        // content: Buffer.from(pdfBuffer),
                        content: "",
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

