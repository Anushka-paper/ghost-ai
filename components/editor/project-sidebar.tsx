"use client"

import { Plus, X, MoreVertical } from "lucide-react"
import { useState, useRef, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { MOCK_PROJECTS } from "@/lib/mock-projects"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onOpenCreateDialog: () => void
  onOpenRenameDialog: (projectId: string, currentName: string) => void
  onOpenDeleteDialog: (projectId: string) => void
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
  onDelete: (projectId: string) => void
}) {
  const [showActions, setShowActions] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showActions) return

    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showActions])

  return (
    <div className="group relative flex items-center justify-between rounded-lg px-3 py-2 hover:bg-subtle">
      <div className="flex-1 truncate">
        <div className="w-full truncate text-left text-sm font-medium text-copy-primary">
          {name}
        </div>
      </div>
      {owned && (
        <>
          <button
            onClick={() => setShowActions(!showActions)}
            className="ml-2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-subtle"
            aria-label="Project actions"
            aria-expanded={showActions}
            aria-controls={`actions-${projectId}`}
          >
            <MoreVertical className="h-4 w-4 text-copy-secondary" aria-hidden="true" />
          </button>
          {showActions && (
            <div
              ref={actionsRef}
              id={`actions-${projectId}`}
              className="absolute right-0 top-full mt-1 space-y-1 rounded-lg border border-surface-border bg-surface p-1 shadow-lg z-50"
              role="menu"
            >
              <button
                role="menuitem"
                onClick={() => {
                  onRename(projectId, name)
                  setShowActions(false)
                }}
                className="block w-full whitespace-nowrap rounded px-3 py-1.5 text-left text-sm text-copy-secondary hover:bg-subtle hover:text-copy-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onRename(projectId, name)
                    setShowActions(false)
                  } else if (e.key === 'Escape') {
                    setShowActions(false)
                  }
                }}
              >
                Rename
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  onDelete(projectId)
                  setShowActions(false)
                }}
                className="block w-full whitespace-nowrap rounded px-3 py-1.5 text-left text-sm text-state-error hover:bg-subtle"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onDelete(projectId)
                    setShowActions(false)
                  } else if (e.key === 'Escape') {
                    setShowActions(false)
                  }
                }}
              >
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onOpenCreateDialog,
  onOpenRenameDialog,
  onOpenDeleteDialog,
  className,
}: ProjectSidebarProps) {
  const ownedProjects = MOCK_PROJECTS.filter((p) => p.owned)
  const sharedProjects = MOCK_PROJECTS.filter((p) => !p.owned)

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
                    owned={project.owned}
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
                    owned={project.owned}
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
