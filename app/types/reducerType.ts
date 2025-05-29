import { CompanySettings, Invoice, LineItem } from './invoiceTypes';

export type InvoiceAction =
  | { type: 'SET_INVOICES'; payload: Invoice[] }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'DELETE_ALL_INVOICES' };

export type SettingsAction = { type: 'SET_SETTINGS'; payload: CompanySettings };

export type NewInvoiceAction =
  | { type: 'SET_NEW_INVOICE'; payload: Partial<Invoice> }
  | {
      type: 'UPDATE_ITEM';
      payload: { id: string; field: keyof LineItem; value: string | number };
    }
  | { type: 'ADD_ITEM' }
  | { type: 'REMOVE_ITEM'; payload: string };
