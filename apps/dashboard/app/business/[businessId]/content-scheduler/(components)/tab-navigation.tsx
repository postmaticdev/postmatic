"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "manual", label: "Posting Manual" },
  { id: "auto", label: "Posting Otomatis" },
  { id: "history", label: "Riwayat" }
]

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex space-x-1 bg-card p-1 rounded-lg">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 p-4 sm:p-6",
            activeTab === tab.id 
              ? "bg-primary text-white" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
