import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FinanceKaro — V1",
  description: "India's First Financial Education Layer",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanceKaro",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable}`}>
      <head>
        <meta name="application-name" content="FinanceKaro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FinanceKaro" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased min-h-screen flex flex-col items-center bg-[#eaeaea]">
        <main className="w-full max-w-[420px] min-h-screen bg-bg relative shadow-[0_0_50px_rgba(0,0,0,0.1)] flex flex-col overflow-x-hidden pt-[60px] pb-16">
          <div className="flex-1 w-full h-full p-4 overflow-y-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
