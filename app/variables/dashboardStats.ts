import { Timestamp } from 'firebase/firestore';
import { Invoice } from '../types/invoiceTypes';

 
export const dashboardStatsFN = (invoices: Invoice[]) => {
  const currentMonth = new Date().getMonth()
  return {
    totalInvoices: invoices.length,
    totalRevenue: invoices
      .filter((inv) => {
        const lastUpdated = inv.lastUpdated
        if (!lastUpdated) {
          console.log("N/A DATE")
          return
        }
        const timestamp = new Timestamp(lastUpdated?.seconds, lastUpdated?.nanoseconds)
        const date = timestamp.toDate()
        //get last updated and compared it
        console.log(date)
        return (date.getMonth() == currentMonth)
      })
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0),
    pendingAmount: invoices
      .filter((inv) => inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.total, 0),
    overdueAmount: invoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0),
    draftCount: invoices.filter((inv) => inv.status === 'draft').length,
    sentCount: invoices.filter((inv) => inv.status === 'sent').length,
    paidCount: invoices.filter((inv) => inv.status === 'paid').length,
    overdueCount: invoices.filter((inv) => inv.status === 'overdue').length,
  };
};

export type DasboardType = ReturnType<typeof dashboardStatsFN>;
