"use client"

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSolanaNetwork } from "@/app/components/SolanaWalletProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ChevronsUpDown, LogOut, Copy, Globe2 } from "lucide-react";
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function NavUser() {
  const { publicKey, disconnect, connected } = useWallet();
  const { state } = useSidebar(); // "collapsed" | "expanded"
  const { network, setNetwork } = useSolanaNetwork();
  const [copied, setCopied] = useState(false);
  const address = publicKey?.toBase58() ?? "";

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // NOT CONNECTED
  if (!publicKey) {
    if (state === "collapsed") {
      return (
        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <WalletMultiButton
                  style={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    minHeight: 40,
                    fontSize: 0,
                    borderRadius: "50%",
                    background: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                  }}
                  className="hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-label="Подключить кошелек"
                >
                  {/* Wallet icon */}
                  <svg viewBox="0 0 24 24" fill="none" width="22" height="22" className="text-white">
                    <rect x="3" y="7" width="18" height="10" rx="2" fill="#fff" fillOpacity={0.2}/>
                    <rect x="7" y="11" width="2" height="2" rx="1" fill="#fff" />
                  </svg>
                </WalletMultiButton>
              </TooltipTrigger>
              <TooltipContent side="right">Подключить кошелек</TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      );
    }
    // expanded
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <WalletMultiButton
            style={{
              width: "100%",
              minWidth: 0,
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: "0.75rem",
              background: "#2563eb",
              color: "#fff",
              padding: "0.5rem 1rem",
              border: "2px solid #2563eb",
              boxShadow: "0 2px 8px 0 rgba(37,99,235,0.08)",
              transition: "background 0.15s, border 0.15s, color 0.15s",
              cursor: "pointer",
              overflow: "hidden",
              margin: "0.25rem 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "0.75rem",
              height: 44,
            }}
            className="hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label="Connect wallet"
          >
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22" className="text-white">
              <rect x="3" y="7" width="18" height="10" rx="2" fill="#fff" fillOpacity={0.2}/>
              <rect x="7" y="11" width="2" height="2" rx="1" fill="#fff" />
            </svg>
            <span style={{fontSize: '0.95rem', fontWeight: 600}}>Select Wallet</span>
          </WalletMultiButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // CONNECTED
  if (state === "collapsed") {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton size="icon" className="rounded-full bg-blue-600 p-0 w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22" className="text-white">
                  <rect x="3" y="7" width="18" height="10" rx="2" fill="#fff" fillOpacity={0.2}/>
                  <rect x="7" y="11" width="2" height="2" rx="1" fill="#fff" />
                </svg>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">{address.slice(0, 4)}...{address.slice(-4)}</TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // expanded, connected
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full rounded-lg"
            >
              <Avatar className="h-8 w-8 rounded-lg bg-blue-600">
                {/* Wallet icon SVG */}
                <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className="text-white">
                  <rect x="3" y="7" width="18" height="10" rx="2" fill="#2563eb" />
                  <rect x="7" y="11" width="2" height="2" rx="1" fill="#fff" />
                </svg>
                <AvatarFallback className="rounded-lg">
                  {address.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-medium">
                {address.slice(0, 4)}...{address.slice(-4)}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">Solana</span>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-0">
            <DropdownMenuLabel className="flex flex-col items-start gap-0.5 px-4 pt-4 pb-2">
              <span className="font-medium text-base">
                {address.slice(0, 4)}...{address.slice(-4)}
              </span>
              <span className="text-xs text-muted-foreground">Solana</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
                <Copy className="mr-2 size-4" />
                {copied ? "Copied!" : "Copy address"}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={address ? `/account/${address}` : "#"} className="cursor-pointer">
                  <Globe2 className="mr-2 size-4" />
                  My account
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                try {
                  if (connected) {
                    await disconnect();
                  }
                } catch (e) {
                  // Безопасно игнорируем WalletDisconnectionError
                }
              }}
              className="cursor-pointer text-destructive"
              aria-label="Disconnect wallet"
            >
              <LogOut className="mr-2 size-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
