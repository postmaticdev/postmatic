"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "members", label: "Anggota" },
  { id: "history", label: "Riwayat Transaksi" }
]

export function SettingsTabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex space-x-1 bg-muted p-1 rounded-lg">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 p-6",
            activeTab === tab.id 
              ? "bg-primary text-white" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="truncate">{tab.label}</span>
        </Button>
      ))}
    </div>
  )
}
