import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'
// import dotenv from 'dotenv'
// dotenv.config({ path: "../../.env.local" })
const { AWS_SES_USER, AWS_SES_PASS } = process.env

if (!AWS_SES_USER || !AWS_SES_PASS) {
    throw new Error("Missing AWS_SES_USER/AWS_SES_PASS in environment.");
}

const mailer = nodemailer.createTransport({
    host: "email-smtp.us-east-2.amazonaws.com",
    port: 587,
    secure: false,
    auth: {
        user: AWS_SES_USER,
        pass: AWS_SES_PASS,
    },
})
export async function sendEmail(to: string[] | string, subject: string, text: string = "", attachment?: Mail.Attachment[]) {
    const res = await mailer.sendMail({
        from: 'invoicely-noreply@matthewautjoa.tech',
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        text: text, // plain‑text body
        html: generateEmailHTML(text, subject),
        attachments: attachment
    })
}

function generateEmailHTML(text: string, subject: string): string {
    // Convert line breaks to HTML
    const htmlText = text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold formatting
        .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>'); // List items

    const formattedText = htmlText.includes('<li>')
        ? htmlText.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
        : htmlText;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #2563eb;
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 30px 20px;
        }
        .content p {
            margin: 0 0 16px 0;
            font-size: 16px;
        }
        .content ul {
            margin: 16px 0;
            padding-left: 20px;
        }
        .content li {
            margin: 8px 0;
            font-size: 16px;
        }
        .highlight {
            background-color: #fef3c7;
            padding: 16px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .btn {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .btn:hover {
            background-color: #1d4ed8;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>Invoicely</h1>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p>${formattedText}</p>
            
            ${subject.toLowerCase().includes('overdue') ? `
            <div class="highlight">
                <strong>Action Required:</strong> This invoice is past due. Please submit payment to avoid late fees.
            </div>
            ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>This email was sent by <strong>Invoicely</strong></p>
            <p>If you have any questions, please contact our support team.</p>
            <p style="font-size: 12px; margin-top: 20px;">
                © ${new Date().getFullYear()} Invoicely. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
}

async function test() {
    const [, , to, subject, text, ...rest] = process.argv
    await sendEmail(to, subject, text, undefined)
}
// test()