"use client";

import { ReactNode } from "react";

export default function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between">
      <div className="font-semibold text-lg">Market Dashboard</div>
      {children}
    </header>
  );
}
