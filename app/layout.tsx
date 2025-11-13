import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminAuthProvider } from "@/lib/auth/AdminAuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Downxtown Admin Panel",
  description: "Admin panel for managing Downxtown platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  );
}
