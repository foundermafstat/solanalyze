'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import { useEffect, useState } from 'react';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

import DashboardLayout from './components/layout/DashboardLayout';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { SolanaWalletProvider } from './components/SolanaWalletProvider';

function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider>
      <SolanaWalletProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </SolanaWalletProvider>
    </ThemeProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
