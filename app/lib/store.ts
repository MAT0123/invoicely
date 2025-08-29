import { createContext } from "react"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { TabType } from "../types/invoiceTypes"

export const store = create(
    subscribeWithSelector((set: any) => ({
        activeTab: "dashboard" as TabType,
        changeTabType: (tab: TabType) => { set({ activeTab: tab }) }
    }))
)

export const StoreContext = createContext(store)