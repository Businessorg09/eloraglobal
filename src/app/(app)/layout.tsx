import type { Metadata } from "next";
import Script from 'next/script';
import GlobalMobileNav from '@/components/dashboard/GlobalMobileNav';
import "../globals.css";

export const metadata: Metadata = {
  title: "Elora Global — Trading & MLM Ecosystem",
  description: "Simulated funded trading accounts and binary network business",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Script src="https://unpkg.com/@phosphor-icons/web" strategy="lazyOnload" />
        <GlobalMobileNav />
      </body>
    </html>
  );
}
