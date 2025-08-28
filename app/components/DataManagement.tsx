import React, { useEffect, useState } from 'react';
import { CompanySettings, Invoice } from '../types/invoiceTypes';
import { getAuth, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import { registerPasskey } from '../lib/passkeyHelper';
import { doc, getDoc } from 'firebase/firestore';
import { verifyToken } from '../lib/firebaseService';
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
  const [passkeyState, setPasskeyState] = useState(true)

  useEffect(() => {
    const currentUser = auth.currentUser
    const email = auth.currentUser?.email

    if (!currentUser) {
      return;
    }
    if (email) {
      getDoc(doc(db, "users", email)).then((e) => {
        setPasskeyState(e.exists())
      })
      return
    }

    verifyToken().then((claims) => {
      getDoc(doc(db, "users", claims["email"] as string)).then((e) => {
        setPasskeyState(e.exists())
      })
    }).catch((e) => {
      console.log(e)
    }).finally(() => {

    })


  }, [])
  return (
    <div className="pt-6 border-t-2 border-gray-300">
      <h3 className="text-lg font-bold text-black mb-4">Data Management</h3>
      <div className="w-full flex justify-center items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full grid-auto-rows max-w-2xl">
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
              // const passkeyCookiesAvailable = document.cookie.includes('passkey')
              // if (!getAuth().currentUser) {
              //   const r = await fetch("/api/logout", {
              //     method: "POST",
              //     credentials: "include"
              //   })
              //   router.replace("/")
              //   console.log(await r.json())
              //   return
              // }
              await signOut(auth);
              router.replace("/authentication")
            }}
            className="col-span-1 md:col-span-3 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors border-2 border-red-700 w-full "
          >
            Log Out
          </button>
          {
            !passkeyState &&
            (
              <button
                onClick={async () => {
                  const currentUser = getAuth().currentUser?.email
                  if (currentUser) {
                    const status = await registerPasskey(currentUser)
                    if (status.status == 200) {
                      setPasskeyState(true)
                    }
                  }
                }}
                className="col-span-1 md:col-span-3 px-4 py-3 bg-black text-white rounded-lg font-bold hover:bg-gray-700 transition-colors border-2 w-full"
              >
                Associate Passkey
              </button>
            )
          }

        </div>
      </div>
    </div >
  );
}
