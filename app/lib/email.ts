import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

const mailer = nodemailer.createTransport({
    host: "email-smtp.us-east-2.amazonaws.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.NEXT_PUBLIC_AWS_SES_USER,
        pass: process.env.NEXT_PUBLIC_AWS_SES_PASS,
    },
})
export async function sendEmail(to: string[] | string, subject: string, text: string = "", attachment?: Mail.Attachment[]) {
    const res = await mailer.sendMail({
        from: 'invoicely-noreply@matthewautjoa.tech',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        text: text, // plain‑text body
        html: "<b>WHERE'S MY MONEY BRO</b>",
        attachments: attachment
    })
}