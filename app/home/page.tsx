'use client';

import React, { useState, useEffect, useRef } from 'react';
import InvoicePDFGenerator, { InvoiceData } from '../components/InvoiceGenerator';
import { collection, deleteDoc, doc, DocumentData,  getDocs, updateDoc } from 'firebase/firestore';
import { app, db } from '../lib/firebaseConfig';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { convertInvoiceDataToInvoice } from '../lib/convert';
import { useRouter } from 'next/navigation';
import AllInvoices from '../components/AllInvoices';
import { getStatusColor } from '../lib/styleVariable';

// Interfaces
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}
export interface InvoicesWithFirestoreID{
        data: InvoiceData;
        id: string
}
export type StatusType = 'draft' | 'sent' | 'paid' | 'overdue'
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

// Main Dashboard Component
const InvoiceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    defaultTaxRate: 10,
    invoicePrefix: 'INV-',
    paymentTerms: ''
  });

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    items: [{
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }],
    subtotal: 0,
    tax: 0,
    taxRate: 10,
    discount: 0,
    total: 0,
    notes: ''
  });
  async function getSavedInvoicesFromFirestore(userID:string): Promise<DocumentData | null> {
    console.log(userID)
    if (db) {
      const item = await getDocs(collection(db, "users" , userID ,"invoices"));
     //const invoices = item.docs.map(doc => ({ id: doc.id, ...doc.data() as InvoiceData }));
     const invoices = item.docs.map(doc => ({
         
            id: doc.id , data: doc.data() as InvoiceData
         
        }));

      return invoices
    } else {
      // Optionally handle the case where userID is undefined
      console.warn("User ID is undefined. Cannot fetch invoices.");
      return null
    }
  }
  const router = useRouter()

    const [mounted , setMounted ] = useState(false)
    const hasInitialized = useRef(false);

    useEffect(() => {
  const auth = getAuth(app);

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userID = user.uid;

      // 1. Load invoices from Firestore
      const data = await getSavedInvoicesFromFirestore(userID) as InvoicesWithFirestoreID[];
      const convertedData = data.map((invoice) =>
        convertInvoiceDataToInvoice(invoice.data, invoice.id)
      );
      setInvoices(convertedData);

      // 2. Load settings from localStorage
      const savedSettings = localStorage.getItem('companySettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
        console.log("Loaded settings from localStorage:", JSON.parse(savedSettings));
      }
    } else {
      // Optionally redirect if not logged in
       router.push('/');
    }
    hasInitialized.current = true;
  });

  return () => unsubscribe();
}, []);




  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    if(hasInitialized.current){
    localStorage.setItem('companySettings', JSON.stringify(settings));
    console.log("saving settings")
    }
    
  }, [settings]);

  // Generate next invoice number
  const generateInvoiceNumber = () => {
    const lastInvoice = invoices
      .filter(inv => inv.invoiceNumber.startsWith(settings.invoicePrefix))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    if (!lastInvoice) {
      return `${settings.invoicePrefix}001`;
    }
    
    const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(settings.invoicePrefix, ''));
    return `${settings.invoicePrefix}${String(lastNumber + 1).padStart(3, '0')}`;
  };

  // Calculate invoice totals
  const calculateTotals = (items: LineItem[], taxRate: number, discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax - discount;
    return { subtotal, tax, total };
  };

  // Update new invoice item
  const updateNewInvoiceItem = (id: string, field: keyof LineItem, value: string | number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items!.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Add new item to invoice
  const addNewInvoiceItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setNewInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  // Remove item from invoice
  const removeNewInvoiceItem = (id: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items!.filter(item => item.id !== id)
    }));
  };
  

  // Update invoice status
  const updateInvoiceStatus = async (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv
    ));
    const auth = getAuth(app)
    const userID = auth.currentUser?.uid
    if(userID){
        const res = await updateDoc(doc(db, "users", userID, "invoices", id)  , {
        status
    })
    }
  
  };

  // Delete invoice
  const deleteInvoice = async (invoiceId: string) => {
  if (confirm('Are you sure you want to delete this invoice?')) {
    // Update local state
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));

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
};
   const deleteAllInvoice = async () => {


  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;

  if (userId) {
    try {
      await Promise.all(
        invoices.map(inv =>
          deleteDoc(doc(db, "users", userId, "invoices", inv.id))
        )
      );
      setInvoices([]); 
    } catch (error) {
      console.error("Error deleting all invoices:", error);
    }
  }
};
  // Calculate dashboard stats
  const dashboardStats = {
    totalInvoices: invoices.length,
    totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    pendingAmount: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0),
    overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0),
    draftCount: invoices.filter(inv => inv.status === 'draft').length,
    sentCount: invoices.filter(inv => inv.status === 'sent').length,
    paidCount: invoices.filter(inv => inv.status === 'paid').length,
    overdueCount: invoices.filter(inv => inv.status === 'overdue').length
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-black">{settings.companyName}</h1>
              <p className="text-black font-medium">Invoice Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-black font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${dashboardStats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-100 border-b-2 border-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: '📊' },
              { key: 'create', label: 'Create Invoice', icon: '➕' },
              { key: 'invoices', label: 'All Invoices', icon: '📄' },
              { key: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">Dashboard Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-400">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-black">Total Invoices</p>
                      <p className="text-2xl font-bold text-black">{dashboardStats.totalInvoices}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-400">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-black">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">${dashboardStats.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-400">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <span className="text-2xl">⏳</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-black">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">${dashboardStats.pendingAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-400">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100">
                      <span className="text-2xl">🚨</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-black">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">${dashboardStats.overdueAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-400">
                <h3 className="text-xl font-bold text-black mb-4">Invoice Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600">{dashboardStats.draftCount}</div>
                    <div className="text-sm font-medium text-black">Draft</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{dashboardStats.sentCount}</div>
                    <div className="text-sm font-medium text-black">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{dashboardStats.paidCount}</div>
                    <div className="text-sm font-medium text-black">Paid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{dashboardStats.overdueCount}</div>
                    <div className="text-sm font-medium text-black">Overdue</div>
                  </div>
                </div>
              </div>

              {/* Recent Invoices */}
              {invoices.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-400">
                  <h3 className="text-xl font-bold text-black mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-bold text-black">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-black">{invoice.clientName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(invoice.status)}`}>
                            {invoice.status.toUpperCase()}
                          </span>
                          <div className="text-right">
                            <p className="font-bold text-black">${invoice.total.toFixed(2)}</p>
                            <p className="text-xs text-black">{invoice.invoiceDate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Invoice Tab */}
        {activeTab === 'create' && (
            <InvoicePDFGenerator
            settings={settings}
            callback={(data) =>  {
                
                setInvoices(prev => [
                    ...prev ,
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
                    updatedAt: new Date().toISOString().slice(0, 10)
                    }
                ])
            }}/>
        )}

        {/* All Invoices Tab */}
        {activeTab === 'invoices' && (
          <AllInvoices invoices={invoices} setActiveTab={setActiveTab} updateInvoiceStatus={updateInvoiceStatus} getStatusColor={getStatusColor} setNewInvoice={setNewInvoice} deleteInvoice={deleteInvoice} />
        )}
    
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-black">Company Settings</h2>
            
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-400 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-black">Company Information</h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Company Name</label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Company Address</label>
                    <textarea
                      value={settings.companyAddress}
                      onChange={(e) => setSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={settings.companyPhone}
                      onChange={(e) => setSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Email Address</label>
                    <input
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                    />
                  </div>
                </div>

                {/* Invoice Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-black">Invoice Settings</h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Default Tax Rate (%)</label>
                    <input
                      type="number"
                      value={settings.defaultTaxRate}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Invoice Number Prefix</label>
                    <input
                      type="text"
                      value={settings.invoicePrefix}
                      onChange={(e) => setSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                      placeholder="e.g., INV-, BILL-, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Default Payment Terms</label>
                    <textarea
                      value={settings.paymentTerms}
                      onChange={(e) => setSettings(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium resize-none"
                      placeholder="Enter default payment terms and conditions"
                    />
                  </div>
                </div>
              </div>

              {/* Save Settings Button */}
              <div className="pt-6 border-t-2 border-gray-300">
                <button
                  onClick={() => {
                    alert('Settings saved successfully!');
                  }}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-black text-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 border-2 border-green-700"
                >
                  Save Settings
                </button>
              </div>

              {/* Data Management */}
               <div className="pt-6 border-t-2 border-gray-300">
                <h3 className="text-lg font-bold text-black mb-4">Data Management</h3>
                <div className='w-full flex justify-center items-center'>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify({ invoices, settings }, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'invoice-data-backup.json';
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors border-2 border-blue-700"
                    >
                      Export Data
                    </button>
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              try {
                                const data = JSON.parse(e.target?.result as string);
                                if (data.invoices) setInvoices(data.invoices);
                                if (data.settings) setSettings(data.settings);
                                alert('Data imported successfully!');
                              } catch (error) {
                                alert('Error importing data. Please check the file format.');
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        input.click();
                      }}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors border-2 border-green-700"
                    >
                      Import Data
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                          setInvoices([]);
                          localStorage.removeItem('invoices');
                          localStorage.removeItem('companySettings');
                          alert('All data cleared successfully!');
                          deleteAllInvoice();
                        }
                      }}
                      className="px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors border-2 border-red-700"
                    >
                      Clear All Data
                    </button>
                    
                    <button
                      onClick={async () => {
                        const auth = getAuth(app);
                        await signOut(auth);
                      }}
                      className="col-span-1 md:col-span-3 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors border-2 border-red-700 w-full "
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceDashboard; 