import React from 'react'
import { DasboardType } from '../variables/dashboardStats'
import { Invoice } from '../types/invoiceTypes'
import { getStatusColor } from '../lib/styleVariable'

export default function Dashboard({dashboardStats , invoices} : {dashboardStats: DasboardType , invoices:Invoice[]}) {
  return (
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
  )
}
