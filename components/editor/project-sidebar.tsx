"use client"

import { Pencil, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description?: string | null
  ownerId: string
}

interface ProjectSidebarProps {
  ownedProjects: Project[]
  sharedProjects: Project[]
  isOpen: boolean
  onClose: () => void
  onOpenCreateDialog: () => void
  onOpenRenameDialog: (projectId: string, currentName: string) => void
  onOpenDeleteDialog: (projectId: string, projectName: string) => void
  className?: string
}

function EmptyProjectState() {
  return (
    <div className="flex min-h-48 flex-1 items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-subtle/40 px-6 text-center">
      <p className="text-sm leading-6 text-copy-muted">No projects to show yet.</p>
    </div>
  )
}

function ProjectItem({
  projectId,
  name,
  owned,
  onRename,
  onDelete,
}: {
  projectId: string
  name: string
  owned: boolean
  onRename: (projectId: string, name: string) => void
  onDelete: (projectId: string, name: string) => void
}) {
  return (
    <div className="group relative flex items-center justify-between rounded-lg px-3 py-2 hover:bg-subtle">
      <div className="flex-1 truncate">
        <div className="w-full truncate text-left text-sm font-medium text-copy-primary">
          {name}
        </div>
      </div>
      {owned && (
        <div className="ml-2 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onRename(projectId, name)}
            className="rounded p-1 text-copy-secondary hover:bg-subtle hover:text-copy-primary"
            aria-label={`Rename ${name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(projectId, name)}
            className="rounded p-1 text-state-error hover:bg-subtle"
            aria-label={`Delete ${name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}

export function ProjectSidebar({
  ownedProjects,
  sharedProjects,
  isOpen,
  onClose,
  onOpenCreateDialog,
  onOpenRenameDialog,
  onOpenDeleteDialog,
  className,
}: ProjectSidebarProps) {

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-base/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

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

          <TabsContent value="my-projects" className="mt-4 flex min-h-0 flex-1 flex-col">
            {ownedProjects.length > 0 ? (
              <div className="space-y-1 overflow-y-auto">
                {ownedProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    projectId={project.id}
                    name={project.name}
                    owned={true}
                    onRename={onOpenRenameDialog}
                    onDelete={onOpenDeleteDialog}
                  />
                ))}
              </div>
            ) : (
              <EmptyProjectState />
            )}
          </TabsContent>

          <TabsContent value="shared" className="mt-4 flex min-h-0 flex-1 flex-col">
            {sharedProjects.length > 0 ? (
              <div className="space-y-1 overflow-y-auto">
                {sharedProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    projectId={project.id}
                    name={project.name}
                    owned={false}
                    onRename={onOpenRenameDialog}
                    onDelete={onOpenDeleteDialog}
                  />
                ))}
              </div>
            ) : (
              <EmptyProjectState />
            )}
          </TabsContent>
        </Tabs>

        <Button
          type="button"
          className="mt-4 w-full"
          onClick={onOpenCreateDialog}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Project
        </Button>
      </aside>
    </>
  )
}
