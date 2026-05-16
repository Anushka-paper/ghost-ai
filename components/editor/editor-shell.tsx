"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { useProjectActions } from "@/hooks/useProjectActions"

interface Project {
  id: string
  name: string
  description?: string | null
  ownerId: string
}

interface EditorShellProps {
  ownedProjects: Project[]
  sharedProjects: Project[]
}

export function EditorShell({ ownedProjects, sharedProjects }: EditorShellProps) {
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(true)
  const projectActions = useProjectActions()

  useEffect(() => {
    return () => {
      projectActions.cleanup()
    }
  }, [projectActions])

  return (
    <div className="flex min-h-screen flex-col bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isProjectSidebarOpen}
        onToggleSidebar={() => setIsProjectSidebarOpen((isOpen) => !isOpen)}
      />

      <main className="relative min-h-0 flex-1 overflow-hidden">
        <ProjectSidebar
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          isOpen={isProjectSidebarOpen}
          onClose={() => setIsProjectSidebarOpen(false)}
          onOpenCreateDialog={projectActions.openCreateDialog}
          onOpenRenameDialog={projectActions.openRenameDialog}
          onOpenDeleteDialog={projectActions.openDeleteDialog}
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
            <Button onClick={projectActions.openCreateDialog} size="lg">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Project
            </Button>
          </div>
        </div>
      </main>

      <ProjectDialogs
        dialogType={projectActions.dialog.type}
        projectId={projectActions.dialog.projectId}
        currentName={projectActions.dialog.projectName}
        formName={projectActions.form.name}
        isLoading={projectActions.isLoading}
        error={projectActions.error}
        onNameChange={projectActions.updateFormName}
        onClose={projectActions.closeDialog}
        onSubmit={projectActions.handleSubmit}
      />
    </div>
  )
}
