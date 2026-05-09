"use client"

import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

function EmptyProjectState() {
  return (
    <div className="flex min-h-48 flex-1 items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-subtle/40 px-6 text-center">
      <p className="text-sm leading-6 text-copy-muted">No projects to show yet.</p>
    </div>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  className,
}: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed left-3 top-17 z-40 flex h-[calc(100vh-5rem)] w-80 max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border border-surface-border bg-surface/95 p-4 shadow-2xl shadow-base/60 backdrop-blur transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+1.5rem)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close project sidebar"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="mt-4 min-h-0 flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="my-projects" className="mt-4 flex min-h-0 flex-1">
          <EmptyProjectState />
        </TabsContent>
        <TabsContent value="shared" className="mt-4 flex min-h-0 flex-1">
          <EmptyProjectState />
        </TabsContent>
      </Tabs>

      <Button type="button" className="mt-4 w-full">
        <Plus className="h-4 w-4" aria-hidden="true" />
        New Project
      </Button>
    </aside>
  )
}
