import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, db } from '../lib/firebaseConfig';
import {
  Invoice,
  InvoicesWithFirestoreID,
  StatusType,
  InvoiceData,
} from '../types/invoiceTypes';
import { getToken, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

export async function getSavedInvoicesFromFirestore(
  userID: string,
): Promise<DocumentData | null> {
  console.log(userID);
  if (db) {
    const item = await getDocs(collection(db, 'users', userID, 'invoices'));
    const invoices = item.docs.map((doc) => ({
      id: doc.id,
      data: doc.data() as InvoiceData,
    }));
    return invoices;
  } else {
    console.warn('User ID is undefined. Cannot fetch invoices.');
    return null;
  }
}

export async function updateInvoiceStatusInFirestore(
  invoiceId: string,
  status: StatusType,
): Promise<void> {
  const auth = getAuth(app);
  const userID = auth.currentUser?.uid;

  if (userID) {
    await updateDoc(doc(db, 'users', userID, 'invoices', invoiceId), {
      status,
    });
  }
}

export async function deleteInvoiceFromFirestore(
  invoiceId: string,
): Promise<void> {
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

export async function uploadImageToFirestore(
  e: React.ChangeEvent<HTMLInputElement>,
): Promise<void> {
  const image = e.target.files?.item(0);
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;
  if (!image) return;
  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64String = reader.result?.toString();
    const auth = getAuth(app);
    const userId = auth.currentUser?.uid;

    if (userId) {
      await setDoc(doc(db, 'users', userId, 'settings', 'logo'), {
        image: base64String,
      });

      localStorage.setItem('logo', base64String ?? '');
    }
  };
  reader.readAsDataURL(image);
}
export async function getLogoFromFirestore(): Promise<string> {
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  if (userId) {
    const res = await getDoc(doc(db, 'users', userId, 'settings', 'logo'));
    localStorage.setItem('logo', res.get('image'));
    console.log(res);
    return res.get('image') as string;
  }
  return '';
}
export async function deleteAllInvoicesFromFirestore(
  invoiceIds: string[],
): Promise<void> {
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  if (userId) {
    try {
      await Promise.all(
        invoiceIds.map((id) =>
          deleteDoc(doc(db, 'users', userId, 'invoices', id)),
        ),
      );
    } catch (error) {
      console.error('Error deleting all invoices:', error);
    }
  }
}

export const getAppCheckToken = async () => {
  try {
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("6LeTMVwrAAAAAA6QRkCDbDsoku23jaD5Xg6k4gwy")

    })
    const token = await getToken(appCheck)
    return token
  } catch {
    return null
  }

}
