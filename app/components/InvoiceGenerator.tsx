'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
  pdf,
  Image,
} from '@react-pdf/renderer';
import { addDoc, collection } from 'firebase/firestore';
import { app, db } from '../lib/firebaseConfig';
import { getToken, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import {
  CompanySettings,
  Invoice,
  InvoiceData,
  LineItem,
  StatusType,
} from '../types/invoiceTypes';
import toast, { Toaster } from 'react-hot-toast';
import { InvoicePDF } from './InvoiceTemplate';


Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

const InvoicePDFGenerator: React.FC<{
  callback?: (data: InvoiceData) => void;
  settings?: CompanySettings;
  image?: string;
}> = ({ settings, callback = () => { }, image }) => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: settings?.invoicePrefix ?? '',
    invoiceDate: '',
    dueDate: '',

    companyName: settings?.companyName ?? '',
    companyAddress: settings?.companyAddress ?? '',
    companyPhone: settings?.companyPhone ?? '',
    companyEmail: settings?.companyEmail ?? '',

    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    status: 'draft',
    items: [],

    subtotal: 0,
    tax: 0,
    taxRate: settings?.defaultTaxRate ?? 0,
    discount: 0,
    total: 0,

    notes: '',
  });
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    const calculateTotals = () => {
      const items = invoiceData.items || [];
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * (invoiceData.taxRate / 100);
      const total = subtotal + tax - invoiceData.discount;

      setInvoiceData((prev) => ({
        ...prev,
        subtotal,
        tax,
        total,
      }));
    };

    if (invoiceData.items.length != 0) {
      calculateTotals();
    }
  }, [invoiceData.items, invoiceData.taxRate, invoiceData.discount]);
  useEffect(() => {
    const dataFromCache = localStorage.getItem('invoiceData');
    if (dataFromCache) {
      setInvoiceData(JSON.parse(dataFromCache));
    }
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
      console.log('Changed');
    }
  }, [invoiceData]);

  const updateInvoiceData = (field: keyof InvoiceData, value: any) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: 'New Item',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const notify = (message: string) => toast(message);

  const updateItem = (
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
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
  };

  const removeItem = (id: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const addToFirestore = async () => {
    invoiceData.status = 'sent';
    const auth = getAuth(app);
    const userID = auth.currentUser?.uid;
    if (userID) {
      const res = await addDoc(
        collection(db, 'users', userID, 'invoices'),
        invoiceData,

      );
      notify('Invoices Created , downloading pdf...');
      if (callback) callback(invoiceData);
    }
  };
  const pdfLinkRef = useRef<PDFDownloadLink | null>(null);

  const handleCreateAndDownload = async () => {

    const auth = getAuth(app);
    const userID = auth.currentUser;

    if (userID) {
      if (invoiceData.total >= 0.1) {
        try {
          await addToFirestore();
          toast.success('Invoice saved to Firestore. Downloading PDF...');
          invoiceData.status = 'sent';

          const blob = await pdf(
            <InvoicePDF invoice={invoiceData} image={image} />,
          ).toBlob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          localStorage.removeItem('invoiceData');
        } catch (error) {
          console.error('Error saving to Firestore:', error);
          toast.error('Failed to save invoice.');
        }
      } else {
        toast.error('Total needs to be larger than $0.1');
      }
    } else {
      toast.error('User not authenticated.');
    }
  };
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Invoice PDF Generator
          </h1>
          <p className="text-black mt-2">
            Create and download professional PDF invoices
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white shadow-lg rounded-lg border-2 border-gray-400 p-6">
            <h2 className="text-xl font-bold text-black mb-6">
              Invoice Details
            </h2>

            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Invoice #
                  </label>
                  <input
                    type="text"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) =>
                      updateInvoiceData('invoiceNumber', e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) =>
                      updateInvoiceData('invoiceDate', e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) =>
                      updateInvoiceData('dueDate', e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-black mb-3">
                Company Information
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={invoiceData.companyName}
                  onChange={(e) =>
                    updateInvoiceData('companyName', e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                />
                <textarea
                  placeholder="Company Address"
                  value={invoiceData.companyAddress}
                  onChange={(e) =>
                    updateInvoiceData('companyAddress', e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={invoiceData.companyPhone}
                    onChange={(e) =>
                      updateInvoiceData('companyPhone', e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={invoiceData.companyEmail}
                    onChange={(e) =>
                      updateInvoiceData('companyEmail', e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-black mb-3">
                Client Information
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Client Name"
                  value={invoiceData.clientName}
                  onChange={(e) =>
                    updateInvoiceData('clientName', e.target.value)
                  }
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                />
                <textarea
                  placeholder="Client Address"
                  value={invoiceData.clientAddress}
                  onChange={(e) =>
                    updateInvoiceData('clientAddress', e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={invoiceData.clientPhone}
                    onChange={(e) =>
                      updateInvoiceData('clientPhone', e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={invoiceData.clientEmail}
                    onChange={(e) =>
                      updateInvoiceData('clientEmail', e.target.value)
                    }
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-black">Line Items</h3>
                <button
                  onClick={addItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-colors"
                >
                  Add Item
                </button>
              </div>

              <div className="space-y-3">
                {invoiceData.items.map((item) => (
                  <div
                    key={item.id ?? 100}
                    className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-md border border-gray-300"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, 'description', e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                        placeholder="Description"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'quantity',
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm text-center"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'rate',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm text-center"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="px-2 py-1 bg-gray-100 rounded text-black text-sm text-center font-bold">
                        ${item.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax and Notes */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={invoiceData.taxRate}
                    onChange={(e) =>
                      updateInvoiceData(
                        'taxRate',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">
                    Discount ($)
                  </label>
                  <input
                    type="number"
                    value={invoiceData.discount}
                    onChange={(e) =>
                      updateInvoiceData(
                        'discount',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">
                  Notes
                </label>
                <textarea
                  value={invoiceData.notes}
                  onChange={(e) => updateInvoiceData('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium resize-none"
                  placeholder="Additional notes or payment terms..."
                />
              </div>
            </div>
          </div>

          {/* Preview and Download Section */}
          <div className="bg-white shadow-lg rounded-lg border-2 border-gray-400 p-6">
            <h2 className="text-xl font-bold text-black mb-6">
              PDF Preview & Download
            </h2>

            {/* Totals Summary */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6 border-2 border-gray-300">
              <h3 className="text-lg font-bold text-black mb-3">
                Invoice Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-black font-medium">Subtotal:</span>
                  <span className="text-black font-bold">
                    ${invoiceData.subtotal.toFixed(2)}
                  </span>
                </div>
                {invoiceData.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-black font-medium">Discount:</span>
                    <span className="text-black font-bold">
                      -${invoiceData.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-black font-medium">
                    Tax ({invoiceData.taxRate}%):
                  </span>
                  <span className="text-black font-bold">
                    ${invoiceData.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t-2 border-gray-400">
                  <span className="text-xl font-black text-black">Total:</span>
                  <span className="text-xl font-black text-blue-600">
                    ${invoiceData.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <Toaster />

            <button
              onClick={handleCreateAndDownload}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-black text-lg shadow-lg hover:bg-blue-700 transition-all duration-200 border-2 border-blue-700 text-center block"
            >
              Create and Download Invoice PDF
            </button>

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-bold text-black mb-2">
                Instructions
              </h4>
              <div className="text-black font-medium text-sm space-y-1">
                <p>1. Fill in all the required information in the form</p>
                <p>2. Add line items for your services or products</p>
                <p>3. Set tax rate and discount if applicable</p>
                <p>4. Click "Download Invoice PDF" to generate your invoice</p>
                <p>
                  5. The PDF will be automatically downloaded to your device
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePDFGenerator;
