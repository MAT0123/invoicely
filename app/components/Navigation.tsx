import React from 'react';
import { TabType } from '../types/invoiceTypes';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

export default function Navigation({
  setActiveTab,
  activeTab,
}: {
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
  activeTab: TabType;
}) {
  const sidebar = useSidebar()
  return (
    <nav className="bg-gray-100 border-b-2 border-gray-400">

      <div className="max-w-7xl  flex justify-center">
        <div className='md:hidden w-full'>
          <button className='px-4 py-3 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border-2 border-red-700 w-full ' onClick={() => {
            sidebar.setOpenMobile(true)
          }}>Show menu</button>
        </div>
        <div className="flex space-x-8 hidden md:block">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '📊' },
            { key: 'create', label: 'Create Invoice', icon: '➕' },
            { key: 'invoices', label: 'All Invoices', icon: '📄' },
            { key: 'settings', label: 'Settings', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-6 font-bold text-sm border-b-2 transition-colors ${activeTab === tab.key
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
  );
}
