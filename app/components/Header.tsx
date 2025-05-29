import React from 'react'

export default function Header({companyName , totalRevenue} : {companyName:string , totalRevenue:number}) {
  return (
    <header className="bg-white shadow-lg border-b-2 border-gray-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-black">{companyName}</h1>
                  <p className="text-black font-medium">Invoice Management System</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-black font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>
  )
}
