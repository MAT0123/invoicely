'use client';

import React, { useState } from 'react';

interface ClientFormData {
  name: string;
  contactNumber: string;
  email: string;
  address: string;
}

const NewClientForm: React.FC = () => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    contactNumber: '',
    email: '',
    address: ''
  });

  const [errors, setErrors] = useState<Partial<ClientFormData>>({});

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Client Data:', formData);
      alert('Client created successfully!');
      // Reset form
      setFormData({
        name: '',
        contactNumber: '',
        email: '',
        address: ''
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      contactNumber: '',
      email: '',
      address: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-700 mb-4">
            <span className="hover:text-black cursor-pointer font-medium">Clients</span>
            <span className="mx-2 text-black">/</span>
            <span className="text-black font-semibold">New Client</span>
          </nav>
          <h1 className="text-3xl font-bold text-black">New Client</h1>
          <p className="text-black mt-2">Add a new client to your database</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white shadow-lg rounded-lg border-2 border-gray-400">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Client Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${
                  errors.name 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-400 focus:border-blue-600'
                }`}
                placeholder="Enter client name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm font-medium">{errors.name}</p>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">
                Contact Number *
              </label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${
                  errors.contactNumber 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-400 focus:border-blue-600'
                }`}
                placeholder="Enter contact number"
              />
              {errors.contactNumber && (
                <p className="text-red-600 text-sm font-medium">{errors.contactNumber}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 text-black font-medium ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-400 focus:border-blue-600'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-600 text-sm font-medium">{errors.email}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200 resize-none text-black font-medium ${
                  errors.address 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-400 focus:border-blue-600'
                }`}
                placeholder="Enter full address including city, state, and postal code"
              />
              {errors.address && (
                <p className="text-red-600 text-sm font-medium">{errors.address}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-black text-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 border-2 border-blue-700"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Client
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 sm:flex-none bg-white text-black py-4 px-6 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 border-2 border-gray-400"
              >
                Cancel
              </button>
            </div>

            {/* Required Fields Note */}
            <div className="pt-4 border-t-2 border-gray-300">
              <p className="text-sm text-black font-medium">
                <span className="text-red-600 font-bold">*</span> Required fields
              </p>
            </div>
          </form>
        </div>

        {/* Additional Info Card */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-black mb-2">Client Information</h3>
              <p className="text-black font-medium">
                This information will be used for invoicing and communication. Make sure all details are accurate and up-to-date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewClientForm;