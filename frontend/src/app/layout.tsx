import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/shared/ui/layout/sidebar";
import { Toaster } from "@/shared/ui/overlay/sonner";

// TODO: SEO

export const metadata: Metadata = {
  title: {
    template: '%s | Подари Песню!',
    default: 'Подари Песню! - панель управления',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`antialiased`}
      >
        <SidebarProvider>
          <Toaster />
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
