import { Invoice } from '../types/invoiceTypes';

export const getStatusColor = (status: Invoice['status']) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'sent':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};
