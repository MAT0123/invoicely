import { useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, app } from '../lib/firebaseConfig'; // adjust to your path

import { Invoice, LineItem, CompanySettings, StatusType } from '../types/invoiceTypes';

export const useInvoice = (
  invoices: Invoice[],
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>,
  settings: CompanySettings,
  setNewInvoice: React.Dispatch<React.SetStateAction<Partial<Invoice>>>
) => {
  // Generate invoice number
  const generateInvoiceNumber = useCallback(() => {
    const lastInvoice = invoices
      .filter(inv => inv.invoiceNumber.startsWith(settings.invoicePrefix))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (!lastInvoice) {
      return `${settings.invoicePrefix}001`;
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(settings.invoicePrefix, ''));
    return `${settings.invoicePrefix}${String(lastNumber + 1).padStart(3, '0')}`;
  }, [invoices, settings]);

  // Calculate totals
  const calculateTotals = useCallback((items: LineItem[], taxRate: number, discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  }, []);

  // Update line item
  const updateNewInvoiceItem = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: (prev.items ?? []).map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  }, [setNewInvoice]);

  // Add new item
  const addNewInvoiceItem = useCallback(() => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setNewInvoice(prev => ({
      ...prev,
      items: [...(prev.items ?? []), newItem],
    }));
  }, [setNewInvoice]);

  // Remove item
  const removeNewInvoiceItem = useCallback((id: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: (prev.items ?? []).filter(item => item.id !== id),
    }));
  }, [setNewInvoice]);

  // Update invoice status in Firebase and state
  const updateInvoiceStatus = useCallback(async (id: string, status: StatusType) => {
    setInvoices(prev => prev.map(inv =>
      inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv
    ));

    const auth = getAuth(app);
    const userID = auth.currentUser?.uid;
    if (userID) {
      await updateDoc(doc(db, 'users', userID, 'invoices', id), { status });
    }
  }, [setInvoices]);

  // Delete a single invoice
  const deleteInvoice = useCallback(async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));

      const auth = getAuth(app);
      const userId = auth.currentUser?.uid;

      if (userId) {
        try {
          await deleteDoc(doc(db, 'users', userId, 'invoices', invoiceId));
          console.log('Invoice deleted:', invoiceId);
        } catch (error) {
          console.error('Error deleting invoice:', error);
        }
      }
    }
  }, [setInvoices]);

  // Delete all invoices
  const deleteAllInvoices = useCallback(async () => {
    const auth = getAuth(app);
    const userId = auth.currentUser?.uid;

    if (userId) {
      try {
        await Promise.all(
          invoices.map(inv =>
            deleteDoc(doc(db, 'users', userId, 'invoices', inv.id))
          )
        );
        setInvoices([]);
      } catch (error) {
        console.error('Error deleting all invoices:', error);
      }
    }
  }, [invoices, setInvoices]);

  return {
    generateInvoiceNumber,
    calculateTotals,
    updateNewInvoiceItem,
    addNewInvoiceItem,
    removeNewInvoiceItem,
    updateInvoiceStatus,
    deleteInvoice,
    deleteAllInvoices,
  };
};
