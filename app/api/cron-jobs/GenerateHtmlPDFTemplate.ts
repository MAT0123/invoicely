import { InvoiceData } from "@/app/types/invoiceTypes";

export function generateInvoiceHTML(invoice: InvoiceData, image?: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: Helvetica, Arial, sans-serif;
                background-color: #FFFFFF;
                padding: 30px;
                font-size: 10px;
                color: #333333;
                line-height: 1.4;
            }

            .page {
                max-width: 595px;
                margin: 0 auto;
                min-height: 842px;
            }

            .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #000000;
            }

            .company-info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            .company-name {
                font-size: 24px;
                font-weight: bold;
                color: #000000;
                margin-bottom: 8px;
            }

            .company-details {
                font-size: 10px;
                color: #333333;
                line-height: 1.4;
            }

            .invoice-section {
                text-align: right;
            }

            .logo {
                width: 80px;
                height: 80px;
                margin-bottom: 8px;
                display: block;
                margin-left: auto;
            }

            .invoice-title {
                font-size: 28px;
                font-weight: bold;
                color: #000000;
                text-align: right;
            }

            .invoice-details {
                font-size: 10px;
                color: #333333;
                text-align: right;
                margin-top: 8px;
                line-height: 1.4;
            }

            .info-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }

            .client-info {
                width: 45%;
            }

            .section-title {
                font-size: 12px;
                font-weight: bold;
                color: #000000;
                margin-bottom: 8px;
                text-transform: uppercase;
            }

            .client-details {
                font-size: 10px;
                color: #333333;
                line-height: 1.4;
            }

            .table {
                margin-bottom: 30px;
                width: 100%;
            }

            .table-header {
                display: flex;
                background-color: #f0f0f0;
                border: 1px solid #000000;
                padding: 8px 4px;
            }

            .table-row {
                display: flex;
                border-bottom: 1px solid #cccccc;
                padding: 6px 4px;
            }

            .table-cell {
                font-size: 9px;
                color: #333333;
                padding: 0 4px;
            }

            .table-cell-header {
                font-size: 10px;
                font-weight: bold;
                color: #000000;
                padding: 0 4px;
            }

            .description-column { width: 50%; }
            .quantity-column { width: 15%; text-align: center; }
            .rate-column { width: 17.5%; text-align: right; }
            .amount-column { width: 17.5%; text-align: right; }

            .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 30px;
            }

            .totals-table {
                width: 40%;
            }

            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 4px 8px;
            }

            .total-row-final {
                display: flex;
                justify-content: space-between;
                padding: 8px;
                background-color: #f0f0f0;
                border: 1px solid #000000;
                margin-top: 4px;
            }

            .total-label {
                font-size: 10px;
                color: #333333;
            }

            .total-value {
                font-size: 10px;
                color: #333333;
                font-weight: bold;
            }

            .total-label-final {
                font-size: 12px;
                color: #000000;
                font-weight: bold;
            }

            .total-value-final {
                font-size: 12px;
                color: #000000;
                font-weight: bold;
            }

            .notes-section {
                margin-bottom: 20px;
            }

            .notes-title {
                font-size: 12px;
                font-weight: bold;
                color: #000000;
                margin-bottom: 8px;
            }

            .notes-text {
                font-size: 10px;
                color: #333333;
                line-height: 1.4;
            }

            .footer {
                margin-top: auto;
                padding-top: 20px;
                border-top: 1px solid #cccccc;
                text-align: center;
            }

            .footer-text {
                font-size: 8px;
                color: #666666;
            }

            @media print {
                body { margin: 0; padding: 20px; }
                .page { margin: 0; }
            }
        </style>
    </head>
    <body>
        <div class="page">
            <div class="header">
                <div class="company-info">
                    <div class="company-name">${invoice.companyName}</div>
                    <div class="company-details">
                        ${invoice.companyAddress}<br/>
                        Phone: ${invoice.companyPhone}<br/>
                        Email: ${invoice.companyEmail}
                    </div>
                </div>
                <div class="invoice-section">
                    ${image ? `<img src="${image}" class="logo" alt="Company Logo" />` : ''}
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-details">
                        Invoice #: ${invoice.invoiceNumber}<br/>
                        Date: ${invoice.invoiceDate}<br/>
                        Due Date: ${invoice.dueDate}
                    </div>
                </div>
            </div>

            <div class="info-section">
                <div class="client-info">
                    <div class="section-title">Bill To:</div>
                    <div class="client-details">
                        ${invoice.clientName}<br/>
                        ${invoice.clientAddress}<br/>
                        Phone: ${invoice.clientPhone}<br/>
                        Email: ${invoice.clientEmail}
                    </div>
                </div>
            </div>

            <div class="table">
                <div class="table-header">
                    <div class="table-cell-header description-column">Description</div>
                    <div class="table-cell-header quantity-column">Qty</div>
                    <div class="table-cell-header rate-column">Rate</div>
                    <div class="table-cell-header amount-column">Amount</div>
                </div>

                ${invoice.items.map(item => `
                    <div class="table-row">
                        <div class="table-cell description-column">${item.description}</div>
                        <div class="table-cell quantity-column">${item.quantity}</div>
                        <div class="table-cell rate-column">$${item.rate.toFixed(2)}</div>
                        <div class="table-cell amount-column">$${item.amount.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>

            <div class="totals-section">
                <div class="totals-table">
                    <div class="total-row">
                        <div class="total-label">Subtotal:</div>
                        <div class="total-value">$${invoice.subtotal.toFixed(2)}</div>
                    </div>

                    ${invoice.discount > 0 ? `
                        <div class="total-row">
                            <div class="total-label">Discount:</div>
                            <div class="total-value">-$${invoice.discount.toFixed(2)}</div>
                        </div>
                    ` : ''}

                    ${invoice.tax > 0 ? `
                        <div class="total-row">
                            <div class="total-label">Tax (${invoice.taxRate}%):</div>
                            <div class="total-value">$${invoice.tax.toFixed(2)}</div>
                        </div>
                    ` : ''}

                    <div class="total-row-final">
                        <div class="total-label-final">Total:</div>
                        <div class="total-value-final">$${invoice.total.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            ${invoice.notes ? `
                <div class="notes-section">
                    <div class="notes-title">Notes:</div>
                    <div class="notes-text">${invoice.notes}</div>
                </div>
            ` : ''}

            <div class="footer">
                <div class="footer-text">${invoice.notes || ''}</div>
            </div>
        </div>
    </body>
    </html>
    `;
}