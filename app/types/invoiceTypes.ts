
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}


export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  
  // Company Info
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  
  // Client Info
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  
  // Invoice Items
  items: LineItem[];
  
  // Totals
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  
  // Notes
  notes: string;

  status:StatusType
}
export interface InvoicesWithFirestoreID {
  data: InvoiceData;
  id: string;
}

export type StatusType = 'draft' | 'sent' | 'paid' | 'overdue';
export type TabType = 'dashboard' | 'create' | 'invoices' | 'settings';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  invoiceDate: string;
  dueDate: string;
  status: StatusType;
  items: LineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultTaxRate: number;
  invoicePrefix: string;
  paymentTerms: string;
}

export interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
}