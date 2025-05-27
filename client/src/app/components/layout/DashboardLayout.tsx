"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import Breadcrumbs from "../ui/Breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeDropdown } from "../ui/ThemeDropdown";
import { ThemeSelect } from '../ui/theme-select';
import { NetworkSelect } from '../ui/NetworkSelect';
import { useWallet } from '@solana/wallet-adapter-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelect />
            {publicKey ? <NetworkSelect /> : null}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
