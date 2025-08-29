"use client"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useContext, useState } from "react"
import { StoreContext } from "../page"
import { TabType } from "../types/invoiceTypes"

const items = [
    {
        title: "Home",
        url: "dashboard",
        icon: Home,
    },
    {
        title: "Create Invoice",
        url: "create",
        icon: Inbox,
    },
    {
        title: "All Invoices",
        url: "invoices",
        icon: Calendar,
    },
    {
        title: "Settings",
        url: "settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const store = useContext(StoreContext)
    const sidebar = useSidebar()
    return (
        <Sidebar variant="floating" >
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <button className="block" onClick={() => {
                                            store.setState((state) => ({
                                                activeTab: item.url as TabType
                                            }))
                                            sidebar.setOpenMobile(false)
                                        }}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </button>

                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}