"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import type { ComponentProps } from "react"
import { 
  Home, 
  MessageSquare, 
  SquareTerminal,
  Wallet,
  BarChart2,
  PieChart,
  LayoutGrid,
  Activity
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"
import { VoiceSelector } from "@/components/agent/voice-select"
import { BroadcastButton } from "@/components/agent/broadcast-button"
import { TokenUsageDisplay } from "@/components/agent/token-usage"
import { MessageControls } from "@/components/agent/message-controls"
import { TextInput } from "@/components/agent/text-input"
import { motion } from "framer-motion"
import { useToolsFunctions } from "@/hooks/use-tools"

// This is sample data.
const data = {
  user: {
    name: "Solanalyze",
    email: "solanalyze@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      id: "1",
      name: "Solanalyze",
      logo: BarChart2,
      plan: "Defi AI Assistant",
    },
    {
      id: "2",
      name: "Analytics",
      logo: Activity,
      plan: "Defi AI Assistant",
    },
    {
      id: "3",
      name: "Portfolio",
      logo: PieChart,
      plan: "Defi AI Assistant",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      items: [
        { title: "Overview", url: "/" },
        { title: "Analytics", url: "/analytics" },
      ],
    },
    {
      title: "Trading",
      url: "/trading",
      icon: BarChart2,
      items: [
        { title: "Spot", url: "/trading/spot" },
        { title: "Futures", url: "/trading/futures" },
        { title: "Options", url: "/trading/options" },
      ],
    },
    {
      title: "Wallet",
      url: "/wallet",
      icon: Wallet,
      items: [
        { title: "Overview", url: "/wallet" },
        { title: "Deposit", url: "/wallet/deposit" },
        { title: "Withdraw", url: "/wallet/withdraw" },
      ],
    },
    {
      title: "Markets",
      url: "/markets",
      icon: LayoutGrid,
      items: [
        { title: "All Pairs", url: "/markets" },
        { title: "Favorites", url: "/markets/favorites" },
        { title: "Gainers & Losers", url: "/markets/movers" },
      ],
    },
  ]
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  // State for voice selection
  const [voice, setVoice] = useState("ash")

  // WebRTC Audio Session Hook
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs = [],
    conversation = [],
    sendTextMessage = () => {}
  } = useWebRTCAudioSession(voice, tools) || {}

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    if (registerFunction) {
      // Register all functions by iterating over the object
      Object.entries(toolsFunctions).forEach(([name, func]) => {
        const functionNames: Record<string, string> = {
          timeFunction: 'getCurrentTime',
          backgroundFunction: 'changeBackgroundColor',
          partyFunction: 'partyMode',
          launchWebsite: 'launchWebsite', 
          copyToClipboard: 'copyToClipboard',
          scrapeWebsite: 'scrapeWebsite'
        };
        
        registerFunction(functionNames[name], func);
      });
    }
  }, [registerFunction, toolsFunctions])
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-hidden">
        <Tabs defaultValue="menu" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">
              <SquareTerminal className="mr-2 h-4 w-4" />
              Menu
            </TabsTrigger>
            <TabsTrigger value="assistant">
              <MessageSquare className="mr-2 h-4 w-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu" className="mt-4 flex-1 overflow-auto">
            <NavMain items={data.navMain} />
          </TabsContent>
          
          <TabsContent value="assistant" className="mt-2 flex-1 flex flex-col h-[calc(100vh-150px)]">
            <div className="flex flex-col h-full">
              <motion.div 
                className="w-full bg-card text-card-foreground rounded-lg border shadow-sm p-2 flex flex-col h-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="flex flex-col h-full">
                  {/* Voice and Broadcast Controls */}
                  <div className="space-y-2 mb-2">
                    <div className="grid grid-cols-1 gap-2">
                      <VoiceSelector value={voice} onValueChange={setVoice} />
                      <BroadcastButton 
                        isSessionActive={isSessionActive} 
                        onClick={handleStartStopClick}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Transcript Area with Fixed Height */}
                  <div className="border rounded-md overflow-hidden flex flex-col flex-1 min-h-0">
                    <div className="overflow-y-auto flex-1 p-2">
                      {status && (
                        <motion.div 
                          className="w-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <MessageControls conversation={conversation} msgs={msgs} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Fixed Input Area */}
                  <div className="mt-2 pt-2 border-t">
                    <TextInput 
                      onSubmit={sendTextMessage}
                      disabled={!isSessionActive}
                      placeholder={isSessionActive ? "Type a message..." : "Start session to chat"}
                      className="w-full"
                    />
                    {msgs?.length > 2 && (
                      <div className="mt-1">
                        <TokenUsageDisplay messages={msgs} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>
        </Tabs>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
