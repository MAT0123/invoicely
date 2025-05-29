import { collection, deleteDoc, doc, DocumentData, getDocs, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, db } from '../lib/firebaseConfig';
import { InvoiceData } from '../components/InvoiceGenerator';
import { Invoice, InvoicesWithFirestoreID, StatusType } from '../types/invoiceTypes';

export async function getSavedInvoicesFromFirestore(userID: string): Promise<DocumentData | null> {
  console.log(userID);
  if (db) {
    const item = await getDocs(collection(db, "users", userID, "invoices"));
    const invoices = item.docs.map(doc => ({
      id: doc.id,
      data: doc.data() as InvoiceData
    }));
    return invoices;
  } else {
    console.warn("User ID is undefined. Cannot fetch invoices.");
    return null;
  }
}

export async function updateInvoiceStatusInFirestore(invoiceId: string, status: StatusType): Promise<void> {
  const auth = getAuth(app);
  const userID = auth.currentUser?.uid;
  
  if (userID) {
    await updateDoc(doc(db, "users", userID, "invoices", invoiceId), {
      status
    });
  }
}

export async function deleteInvoiceFromFirestore(invoiceId: string): Promise<void> {
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  if (userId) {
    try {
      await deleteDoc(doc(db, "users", userId, "invoices", invoiceId));
      console.log("Invoice deleted:", invoiceId);
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  }
}

export async function deleteAllInvoicesFromFirestore(invoiceIds: string[]): Promise<void> {
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  if (userId) {
    try {
      await Promise.all(
        invoiceIds.map(id =>
          deleteDoc(doc(db, "users", userId, "invoices", id))
        )
      );
    } catch (error) {
      console.error("Error deleting all invoices:", error);
    }
  }
}