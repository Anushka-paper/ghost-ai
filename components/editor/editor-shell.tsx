"use client"

import { useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"

export function EditorShell() {
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen flex-col bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isProjectSidebarOpen}
        onToggleSidebar={() => setIsProjectSidebarOpen((isOpen) => !isOpen)}
      />

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <ProjectSidebar
          isOpen={isProjectSidebarOpen}
          onClose={() => setIsProjectSidebarOpen(false)}
        />

        <div className="flex h-full min-h-[calc(100vh-3.5rem)] items-center justify-center bg-base px-6">
          <div className="max-w-md text-center">
            <p className="text-sm font-medium text-copy-primary">
              Editor workspace
            </p>
            <p className="mt-2 text-sm leading-6 text-copy-muted">
              The collaborative canvas will appear here in the next feature
              unit.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
