import React from 'react';
import { CompanySettings, Invoice } from '../types/invoiceTypes';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import { useRouter } from 'next/navigation';
export default function DataManagement({
  invoices,
  settings,
  setInvoices,
  setSettings,
  deleteAllInvoice,
}: {
  invoices: Invoice[];
  settings: CompanySettings;
  setInvoices: (invoices: Invoice[]) => void;
  setSettings: (settings: CompanySettings) => void;
  deleteAllInvoice: () => void;
}) {
  const router = useRouter()
  return (
    <div className="pt-6 border-t-2 border-gray-300">
      <h3 className="text-lg font-bold text-black mb-4">Data Management</h3>
      <div className="w-full flex justify-center items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
          <button
            onClick={() => {
              const dataStr = JSON.stringify({ invoices, settings }, null, 2);
              const dataBlob = new Blob([dataStr], {
                type: 'application/json',
              });
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
                      alert(
                        'Error importing data. Please check the file format.',
                      );
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
              if (
                confirm(
                  'Are you sure you want to clear all data? This action cannot be undone.',
                )
              ) {
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
              const passkeyCookiesAvailable = document.cookie.includes('passkey')
              const passkeyCookie = document.cookie[document.cookie.indexOf("passkey")]
              if (passkeyCookiesAvailable) {
                const r = await fetch("/api/logout", {
                  method: "POST",
                  credentials: "include"
                })
                router.replace("/")
                console.log(await r.json())
                return
              }
              await signOut(auth);
            }}
            className="col-span-1 md:col-span-3 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors border-2 border-red-700 w-full "
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
