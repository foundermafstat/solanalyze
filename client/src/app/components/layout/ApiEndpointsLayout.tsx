"use client";
import { ReactNode } from "react";
import { ThemeToggle } from "../ui/ThemeToggle";
import Sidebar from "../ui/Sidebar";
import Header from "../ui/Header";

export default function ApiEndpointsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header>
          <ThemeToggle />
        </Header>
        <main className="flex-1 p-6 md:p-8 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
