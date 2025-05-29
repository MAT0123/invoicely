'use client';

import React, { useState } from 'react';

interface LineItem {
  id: string;
  item: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceFormData {
  client: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  notes: string;
}

const InvoiceForm: React.FC = () => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    client: '',
    invoiceNumber: '#INV-0001',
    invoiceDate: '',
    dueDate: '',
    lineItems: [
      {
        id: '1',
        item: 'Website Design',
        quantity: 1,
        rate: 500,
        amount: 500
      }
    ],
    notes: ''
  });

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
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

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      item: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const removeLineItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
  };

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Invoice Data:', formData);
    alert('Invoice created successfully!');
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-700 mb-4">
            <span className="hover:text-black cursor-pointer font-medium">Invoices</span>
            <span className="mx-2 text-black">/</span>
            <span className="text-black font-semibold">New Invoice</span>
          </nav>
          <h1 className="text-3xl font-bold text-black">New Invoice</h1>
        </div>

        {/* Main Form Container */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-300">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Selection */}
              <div className="space-y-2">
                <div className='flex justify-between items-center mb-2'>
                <label className="block text-sm font-bold text-black">
                  Client
                </label>
                <a href='/create-client' className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Add New Client
                </a>
                </div>
                
                <div className="relative">
                  <select
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 appearance-none cursor-pointer text-black font-medium"
                  >
                    <option value="" className="text-gray-600">Select a client</option>
                    <option value="client1" className="text-black">Acme Corporation</option>
                    <option value="client2" className="text-black">Tech Startup Inc</option>
                    <option value="client3" className="text-black">Design Studio LLC</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Invoice Number */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-black font-medium"
                />
              </div>

              {/* Invoice Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-black font-medium"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-black">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-black font-medium"
                />
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-black">Line Items</h3>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden border-2 border-gray-400 rounded-lg">
                {/* Table Header */}
                <div className="bg-gray-100 px-6 py-4 border-b-2 border-gray-400">
                  <div className="grid grid-cols-12 gap-4 text-sm font-bold text-black">
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Rate</div>
                    <div className="col-span-2 text-center">Amount</div>
                    <div className="col-span-1"></div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="bg-white">
                  {formData.lineItems.map((item, index) => (
                    <div key={item.id} className={`px-6 py-4 ${index !== formData.lineItems.length - 1 ? 'border-b border-gray-300' : ''}`}>
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) => updateLineItem(item.id, 'item', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-black font-medium"
                            placeholder="Enter item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-black font-medium"
                            min="0"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-black font-bold">$</span>
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 border-2 border-gray-400 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-black font-medium"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="px-3 py-2 bg-gray-100 rounded-md text-center font-bold text-black border-2 border-gray-300">
                            ${item.amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-1 text-center">
                          {formData.lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLineItem(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-all duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {formData.lineItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-900">Line Item</h4>
                      {formData.lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => updateLineItem(item.id, 'item', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter item description"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-md text-center font-semibold text-gray-700">
                          ${item.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Line Item Button */}
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-blue-600 border-2 border-blue-700 rounded-lg hover:bg-blue-700 hover:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Line Item
              </button>
            </div>

            {/* Totals Section */}
            <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-400">
              <h3 className="text-xl font-bold text-black mb-4">Totals</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-black font-bold">Subtotal</span>
                  <span className="text-lg font-bold text-black">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-black font-bold">Tax</span>
                  <span className="text-lg font-bold text-black">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-black font-bold">Discount</span>
                  <span className="text-lg font-bold text-black">${discount.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-black">Total</span>
                    <span className="text-2xl font-black text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes for your client..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 resize-none text-black font-medium"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-black text-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 border-2 border-blue-700"
              >
                Create Invoice
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;