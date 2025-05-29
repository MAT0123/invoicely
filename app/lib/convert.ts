import { InvoiceData } from "../components/InvoiceGenerator";
import { Invoice, StatusType } from "../home/page";
import { v4 as uuidv4 } from 'uuid'; 

export function convertInvoiceDataToInvoice(data: InvoiceData , id:string): Invoice {
  const timestamp = new Date().toISOString();

  return {
    id: id, // generates a unique ID
    invoiceNumber: data.invoiceNumber,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    invoiceDate: data.invoiceDate,
    dueDate: data.dueDate,
    status: data.status as StatusType, // default status
    items: data.items,
    subtotal: data.subtotal,
    tax: data.tax,
    taxRate: data.taxRate,
    discount: data.discount,
    total: data.total,
    notes: data.notes,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
