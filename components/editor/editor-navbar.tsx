"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  className?: string
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  className,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center border-b border-surface-border bg-surface px-3",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close project sidebar" : "Open project sidebar"}
          aria-pressed={isSidebarOpen}
          onClick={onToggleSidebar}
        >
          <SidebarIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center" />

      <div className="flex min-w-0 flex-1 items-center justify-end" />
    </header>
  )
}
