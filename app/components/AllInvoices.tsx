import React from 'react';
import { Invoice, StatusType, TabType } from '../types/invoiceTypes';
interface AllInvoicesProps {
  invoices: Invoice[];
  setActiveTab: (tab: TabType) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  getStatusColor: (status: StatusType) => {};
  setNewInvoice: React.Dispatch<React.SetStateAction<Partial<Invoice>>>;
  deleteInvoice: (id: string) => {};
}
const AllInvoices: React.FC<AllInvoicesProps> = ({
  invoices,
  setActiveTab,
  updateInvoiceStatus,
  getStatusColor,
  setNewInvoice,
  deleteInvoice,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">All Invoices</h2>
        <div className="text-black font-medium">
          Total: {invoices.length} invoices
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-lg border-2 border-gray-400 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-black mb-2">No Invoices Yet</h3>
          <p className="text-black mb-6">
            Create your first invoice to get started.
          </p>
          <button
            onClick={() => setActiveTab('create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Create First Invoice
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-400 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-400">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-black">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-black">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-black">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-black">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-black">
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-black">
                        {invoice.clientName}
                      </div>
                      {invoice.clientEmail && (
                        <div className="text-xs text-gray-600">
                          {invoice.clientEmail}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-black font-medium">
                        {invoice.invoiceDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-black font-medium">
                        {invoice.dueDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={invoice.status}
                        onChange={(e) =>
                          updateInvoiceStatus(
                            invoice.id,
                            e.target.value as Invoice['status'],
                          )
                        }
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(invoice.status)}`}
                      >
                        <option value="draft">DRAFT</option>
                        <option value="sent">SENT</option>
                        <option value="paid">PAID</option>
                        <option value="overdue">OVERDUE</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-black">
                        ${invoice.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            // View invoice details in modal or new page
                            alert(
                              `Invoice Details:\n\nNumber: ${invoice.invoiceNumber}\nClient: ${invoice.clientName}\nTotal: ${invoice.total.toFixed(2)}\nStatus: ${invoice.status.toUpperCase()}\n\nItems:\n${invoice.items.map((item) => `- ${item.description}: ${item.quantity} × ${item.rate} = ${item.amount}`).join('\n')}`,
                            );
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 font-bold border border-blue-300"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            // Edit functionality - populate form with invoice data
                            setNewInvoice({
                              invoiceNumber: invoice.invoiceNumber,
                              clientName: invoice.clientName,
                              clientEmail: invoice.clientEmail,
                              invoiceDate: invoice.invoiceDate,
                              dueDate: invoice.dueDate,
                              status: invoice.status,
                              items: invoice.items,
                              taxRate: invoice.taxRate,
                              discount: invoice.discount,
                              notes: invoice.notes,
                            });
                            setActiveTab('create');
                          }}
                          className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 font-bold border border-yellow-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteInvoice(invoice.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 font-bold border border-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllInvoices;
