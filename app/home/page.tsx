'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useContext } from 'react';
import InvoicePDFGenerator from '../components/InvoiceGenerator';
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs
} from 'firebase/firestore';
import { app, db } from '../lib/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { convertInvoiceDataToInvoice } from '../lib/convert';
import { useRouter } from 'next/navigation';
import AllInvoices from '../components/AllInvoices';
import { getStatusColor } from '../lib/styleVariable';
import {
  Invoice,
  TabType,
  CompanySettings,
  InvoicesWithFirestoreID,
  InvoiceData,
} from '../types/invoiceTypes';
import Navigation from '../components/Navigation';
import Header from '../components/Header';
import { dashboardStatsFN } from '../variables/dashboardStats';
import Dashboard from '../components/Dashboard';
import DataManagement from '../components/DataManagement';
import Settings from '../components/Settings';
import { useInvoice } from '../hooks/useInvoice';
import { checkIfCollectionExist, getLogoFromFirestore } from '../lib/firebaseService';
import dynamic from 'next/dynamic';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '../components/Sidebar';
import { StoreContext } from '../page';

const InvoiceDashboard: React.FC = () => {
  const store = useContext(StoreContext)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    defaultTaxRate: 10,
    invoicePrefix: 'INV-',
    paymentTerms: '',
  });

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    items: [
      {
        id: '1',
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ],
    subtotal: 0,
    tax: 0,
    taxRate: 10,
    discount: 0,
    total: 0,
    notes: '',
  });

  async function getSavedInvoicesFromFirestore(
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
  const router = useRouter();
  const hasInitialized = useRef(false);
  const [logo, setLogo] = useState('');
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    (async () => {

      const passkeyCookiesAvailable = document.cookie.includes('passkey')
      const passkeyCookie = document.cookie[document.cookie.indexOf("passkey")]
      if (!passkeyCookiesAvailable) {
        router.replace('/')
      }
      const auth = getAuth(app);
      const user = auth.currentUser
      const userID = user?.uid ?? passkeyCookie;
      const exist = await checkIfCollectionExist("users", userID, "invoices")

      if (exist) {
        const data = (await getSavedInvoicesFromFirestore(
          userID,
        )) as InvoicesWithFirestoreID[];
        const convertedData = data.map((invoice) =>
          convertInvoiceDataToInvoice(invoice.data, invoice.id),
        );
        setInvoices(convertedData);
      }


      const savedSettings = localStorage.getItem('companySettings');
      const savedLogo = localStorage.getItem('logo');

      if (savedLogo) {
        setLogo(savedLogo);
      } else {
        const res = await getLogoFromFirestore();
        if (res != '') {
          setLogo(res);
        }
      }

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
        console.log(
          'Loaded settings from localStorage:',
          JSON.parse(savedSettings),
        );
      }


      hasInitialized.current = true;;
    })()
    // asyncWrapper()
    setMounted(true)
  }, []);

  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    if (hasInitialized.current) {
      localStorage.setItem('companySettings', JSON.stringify(settings));
      console.log('saving settings');
    }

  }, [settings]);
  const {
    generateInvoiceNumber,
    calculateTotals,
    updateNewInvoiceItem,
    addNewInvoiceItem,
    removeNewInvoiceItem,
    updateInvoiceStatus,
    deleteInvoice,
    deleteAllInvoices,
  } = useInvoice(invoices, setInvoices, settings, setNewInvoice);

  const deleteAllInvoice = async () => {
    const auth = getAuth(app);
    const userId = auth.currentUser?.uid;

    if (userId) {
      try {
        await Promise.all(
          invoices.map((inv) =>
            deleteDoc(doc(db, 'users', userId, 'invoices', inv.id)),
          ),
        );
        setInvoices([]);
      } catch (error) {
        console.error('Error deleting all invoices:', error);
      }
    }
  };

  const dashboardStats = dashboardStatsFN(invoices);

  store.subscribe((state, prev) => {
    if (state.activeTab !== prev.activeTab) {
      setActiveTab(state.activeTab)
    }
  })
  
  if (!mounted) return
  return (

    <div className="min-h-screen bg-white ">
      {/* Header */}

      <Header
        companyName={settings.companyName}
        totalRevenue={dashboardStats.totalRevenue}
      />

      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Dashboard invoices={invoices} dashboardStats={dashboardStats} />
        )}

        {/* Create Invoice Tab */}
        {activeTab === 'create' && (
          <InvoicePDFGenerator
            settings={settings}
            image={logo}
            callback={(data) => {
              setInvoices((prev) => [
                ...prev,
                {
                  id: data.invoiceNumber,
                  invoiceNumber: data.invoiceNumber,
                  clientName: data.clientName,
                  clientEmail: data.companyEmail,
                  invoiceDate: data.invoiceDate,
                  dueDate: data.dueDate,
                  status: data.status,
                  items: data.items,
                  subtotal: data.subtotal,
                  tax: data.tax,
                  taxRate: data.taxRate,
                  discount: data.discount,
                  total: data.total,
                  notes: data.notes,
                  createdAt: new Date().toISOString().slice(0, 10),
                  updatedAt: new Date().toISOString().slice(0, 10),
                },
              ]);
            }}
          />
        )}

        {/* All Invoices Tab */}
        {activeTab === 'invoices' && (
          <AllInvoices
            invoices={invoices}
            setActiveTab={setActiveTab}
            updateInvoiceStatus={updateInvoiceStatus}
            getStatusColor={getStatusColor}
            setNewInvoice={setNewInvoice}
            deleteInvoice={deleteInvoice}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            setSettings={setSettings}
            dataManagementComponent={
              <DataManagement
                invoices={invoices}
                settings={settings}
                setInvoices={setInvoices}
                setSettings={setSettings}
                deleteAllInvoice={deleteAllInvoice}
              />
            }
          />
        )}
      </main>
    </div>
  );
};

export default InvoiceDashboard;
