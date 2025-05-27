"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Market", href: "/market", children: [
      { label: "Amend Order", href: "/market/amend-order" },
      { label: "Balance", href: "/market/balance" },
      { label: "Batch Orders", href: "/market/batch-orders" },
      { label: "Bills", href: "/market/bills" },
      { label: "Books", href: "/market/books" },
      { label: "Candles", href: "/market/candles" },
      { label: "Config", href: "/market/config" },
      // ... остальные подпапки по необходимости
    ] },
  { label: "Trade", href: "/trade", children: [
      { label: "Amend Order", href: "/trade/amend-order" },
      { label: "Balance", href: "/trade/balance" },
      { label: "Batch Orders", href: "/trade/batch-orders" },
      { label: "Bills", href: "/trade/bills" },
      // ... остальные подпапки
    ] },
  { label: "Account", href: "/account", children: [
      { label: "Amend Order", href: "/account/amend-order" },
      { label: "Balance", href: "/account/balance" },
      { label: "Batch Orders", href: "/account/batch-orders" },
      { label: "Bills", href: "/account/bills" },
      // ... остальные подпапки
    ] },
  { label: "System", href: "/system", children: [
      { label: "Amend Order", href: "/system/amend-order" },
      { label: "Balance", href: "/system/balance" },
      // ... остальные подпапки
    ] },
  { label: "Public", href: "/public", children: [
      { label: "Amend Order", href: "/public/amend-order" },
      { label: "Balance", href: "/public/balance" },
      // ... остальные подпапки
    ] },
];

function SidebarMenu({ items, pathname }: { items: typeof menu, pathname: string }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block py-2 px-4 rounded transition ${isActive ? "bg-blue-900 dark:bg-[#173f6a] font-bold" : "dark:hover:bg-[#173f6a] hover:bg-gray-800"}`}
            >
              {item.label}
            </Link>
            {item.children && isActive && (
              <SidebarMenu items={item.children} pathname={pathname} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-gray-900 dark:bg-[#0a2342] text-white hidden md:flex flex-col border-r border-gray-800 dark:border-[#173f6a]">
      <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-gray-800">
        Crypto Dashboard
      </div>
      <nav className="flex-1 py-4 px-2">
        <SidebarMenu items={menu} pathname={pathname} />
      </nav>
    </aside>
  );
}
