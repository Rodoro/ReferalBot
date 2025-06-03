import React from 'react'
import { AppSidebar } from "@/widgets/ui/layouts/Sidebar/app-sidebar";
import { SidebarInset } from "@/shared/ui/layout/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </>
    )
}