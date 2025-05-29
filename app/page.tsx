"use client"
import Image from "next/image";
import InvoiceForm from "./recycle/CreateInvoice";
import NewClientForm from "./recycle/NewClientForm";

import InvoicePDFGenerator from "./components/InvoiceGenerator";
import { useContext, useEffect, useState } from "react";
import { app } from "./lib/firebaseConfig";
import { FirebaseContext } from "./layout";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import InvoiceDashboard from "./home/page";
import AuthForms from "./authentication/page";
export default function Home() {
  const firebaseApp = useContext(FirebaseContext)
  const [user ,setUser] = useState<User | null>(null)
    const [loading ,setLoading] = useState<boolean>(false)

  useEffect(() => {
    if(firebaseApp){
          const auth = getAuth(firebaseApp)
          const unsubscribe = onAuthStateChanged(auth , (user) => {
            setUser(user);
           setLoading(false); // 
           console.log("Change in user")
            })
            // return unsubscribe()
    }
  }, [])
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      {user ? (
        <InvoiceDashboard/>
      ) : (
        <AuthForms />
      )}

    </div>
  );
}
