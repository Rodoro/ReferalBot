import { Separator } from '@/shared/ui/branding/separator'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/shared/ui/layout/breadcrumb'
import { SidebarTrigger } from '@/shared/ui/layout/sidebar'
import React, { Fragment } from 'react'

interface BreadcrumbItem {
    label: string;
    href?: string;
    isCurrent?: boolean;
}

interface HeaderProps {
    breadcrumbs: BreadcrumbItem[];
    showSidebarTrigger?: boolean;
    className?: string;
}

export default function Header({
    breadcrumbs = [
        { label: "Building Your Application", href: "#" },
        { label: "Data Fetching", isCurrent: true },
    ],
    showSidebarTrigger = true,
    className = "",
}: HeaderProps) {
    return (
        <header className={`flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 ${className}`}>
            <div className="flex items-center gap-2 px-4">
                {showSidebarTrigger && (
                    <>
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                    </>
                )}

                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => (
                            <Fragment key={index}>
                                <BreadcrumbItem className={!item.href ? "hidden md:block" : ""}>
                                    {item.href ? (
                                        <BreadcrumbLink href={item.href}>
                                            {item.label}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>
                                            {item.label}
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {index < breadcrumbs.length - 1 && (
                                    <BreadcrumbSeparator className="hidden md:block" />
                                )}
                            </Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    );
}
