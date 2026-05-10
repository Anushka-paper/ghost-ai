"use client"

import { useState, useRef, useEffect } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { useProjectDialogs } from "@/hooks/useProjectDialogs"

export function EditorShell() {
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(true)
  const dialogManager = useProjectDialogs()
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
    }
  }, [])

  const handleDialogSubmit = () => {
    dialogManager.setFormLoading(true)
    // Mock delay - in production, replace with actual API call
    submitTimeoutRef.current = setTimeout(() => {
      try {
        // Simulate form submission
        dialogManager.closeDialog()
      } finally {
        dialogManager.setFormLoading(false)
      }
      submitTimeoutRef.current = null
    }, 500)
  }

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
          onOpenCreateDialog={dialogManager.openCreateDialog}
          onOpenRenameDialog={dialogManager.openRenameDialog}
          onOpenDeleteDialog={dialogManager.openDeleteDialog}
        />

        <div className="flex h-full min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-base px-6">
          <div className="max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-copy-primary">
                Create a project or open an existing one
              </h1>
              <p className="text-sm leading-6 text-copy-muted">
                Start a new architecture workspace, or choose a project from the sidebar.
              </p>
            </div>
            <Button onClick={dialogManager.openCreateDialog} size="lg">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Project
            </Button>
          </div>
        </div>
      </main>

      <ProjectDialogs
        dialogType={dialogManager.dialog.type}
        projectId={dialogManager.dialog.projectId}
        currentName={dialogManager.dialog.projectName || ''}
        formName={dialogManager.form.name}
        isLoading={dialogManager.isLoading}
        onNameChange={dialogManager.updateFormName}
        onClose={dialogManager.closeDialog}
        onSubmit={handleDialogSubmit}
      />
    </div>
  )
}
