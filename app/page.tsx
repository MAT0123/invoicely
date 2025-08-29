'use client';
import Image from 'next/image';
import InvoiceForm from './recycle/CreateInvoice';
import NewClientForm from './recycle/NewClientForm';

import InvoicePDFGenerator from './components/InvoiceGenerator';
import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { app } from './lib/firebaseConfig';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import InvoiceDashboard from './home/page';
import AuthForms from './authentication/page';
import { AppSidebar } from './components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { create } from 'zustand'
import { TabType } from './types/invoiceTypes';
import { subscribeWithSelector } from 'zustand/middleware'

const store = create(
  subscribeWithSelector((set: any) => ({
    activeTab: "dashboard" as TabType,
    changeTabType: (tab: TabType) => { set({ activeTab: tab }) }
  }))
)

export const StoreContext = createContext(store)
export default function Home() {
  const [user, setUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    if (app) {
      const auth = getAuth(app);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(true);
        }
        setLoading(false);
      });
      // return unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className='text-[50px]'>Loading...</p>
      </div>
    );
  }

  return (
    <StoreContext.Provider value={store}>
      <div className="bg-white min-h-screen flex items-center justify-center">
        <SidebarProvider style={{
          display: 'flex',
          flexFlow: "column",
          justifyContent: "center"
        }} defaultOpen={false}>
          <AppSidebar />
          {user ? <InvoiceDashboard /> : <AuthForms />}

        </SidebarProvider>
      </div>

    </StoreContext.Provider>
  );
}
