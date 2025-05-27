"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuMap: Record<string, string> = {
  "": "Home",
  dashboard: "Dashboard",
  market: "Market",
  trade: "Trade",
  account: "Account",
  system: "System",
  public: "Public",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  let path = "";

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 dark:text-gray-200" aria-label="Breadcrumbs">
      <Link href="/" className="hover:underline">Home</Link>
      {segments.map((seg, idx) => {
        path += `/${seg}`;
        const isLast = idx === segments.length - 1;
        return (
          <span key={path} className="flex items-center">
            <span className="mx-1">/</span>
            {isLast ? (
              <span className="text-blue-400 font-semibold">{menuMap[seg] || seg}</span>
            ) : (
              <Link href={path} className="hover:underline">{menuMap[seg] || seg}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
