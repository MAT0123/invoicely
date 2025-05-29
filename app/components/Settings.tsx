import React from 'react'
import { CompanySettings } from '../types/invoiceTypes';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from '../lib/firebaseConfig';
import { uploadImageToFirestore } from '../lib/firebaseService';

export default function Settings({settings , setSettings , dataManagementComponent} : {settings:CompanySettings , setSettings: React.Dispatch<React.SetStateAction<CompanySettings>> , dataManagementComponent: React.ReactNode}) {
  return (
   <div className="space-y-8">
               <h2 className="text-2xl font-bold text-black">Company Settings</h2>
               
               <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-400 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                       <label className="block text-sm font-bold text-black mb-1">Invoice Logo</label>
                       <input
                         type="file"
                         accept='image/*'
                         onChange={(e) => {
                             uploadImageToFirestore(e)
                         }}
                         className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-black font-medium"
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
   
                 {/* <DataManagement invoices={invoices} settings={settings} setInvoices={setInvoices} setSettings={setSettings } deleteAllInvoice={deleteAllInvoice} /> */}
                { dataManagementComponent }
               </div>
             </div>
  )
}
