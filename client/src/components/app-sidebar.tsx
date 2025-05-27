"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Solanalyze",
    email: "solanalyze@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Solanalyze",
      logo: GalleryVerticalEnd,
      plan: "DeFi AI Agent",
    },
    {
      name: "Solanalyze",
      logo: AudioWaveform,
      plan: "DeFi AI Agent",
    },
    {
      name: "Solanalyze",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: SquareTerminal,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
    },
    {
      title: "Market",
      url: "/market",
      icon: BookOpen,
      items: [
        { title: "Amend Order", url: "/market/amend-order" },
        { title: "Balance", url: "/market/balance" },
        { title: "Batch Orders", url: "/market/batch-orders" },
        { title: "Bills", url: "/market/bills" },
        { title: "Books", url: "/market/books" },
        { title: "Candles", url: "/market/candles" },
        { title: "Config", url: "/market/config" },
        // ... остальные подпапки
      ],
    },
    {
      title: "Trade",
      url: "/trade",
      icon: Bot,
      items: [
        { title: "Amend Order", url: "/trade/amend-order" },
        { title: "Balance", url: "/trade/balance" },
        { title: "Batch Orders", url: "/trade/batch-orders" },
        { title: "Bills", url: "/trade/bills" },
        // ... остальные подпапки
      ],
    },
    {
      title: "Account",
      url: "/account",
      icon: Settings2,
      items: [
        { title: "Amend Order", url: "/account/amend-order" },
        { title: "Balance", url: "/account/balance" },
        { title: "Batch Orders", url: "/account/batch-orders" },
        { title: "Bills", url: "/account/bills" },
        // ... остальные подпапки
      ],
    },
    {
      title: "System",
      url: "/system",
      icon: Frame,
      items: [
        { title: "Amend Order", url: "/system/amend-order" },
        { title: "Balance", url: "/system/balance" },
        // ... остальные подпапки
      ],
    },
    {
      title: "Public",
      url: "/public",
      icon: Map,
      items: [
        { title: "Amend Order", url: "/public/amend-order" },
        { title: "Balance", url: "/public/balance" },
        // ... остальные подпапки
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
