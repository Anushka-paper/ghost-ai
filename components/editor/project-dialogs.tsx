'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface ProjectDialogsProps {
  dialogType: 'create' | 'rename' | 'delete' | null
  projectId?: string
  currentName?: string
  formName: string
  isLoading: boolean
  onNameChange: (name: string) => void
  onClose: () => void
  onSubmit: () => void
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function ProjectDialogs({
  dialogType,
  currentName,
  formName,
  isLoading,
  onNameChange,
  onClose,
  onSubmit,
}: ProjectDialogsProps) {
  const isOpen = dialogType !== null
  const slug = slugify(formName)

  return (
    <>
      <Dialog open={isOpen && dialogType === 'create'} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new project</DialogTitle>
            <DialogDescription>
              Enter a project name to get started
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              
              <Input
                id="project-name"
                placeholder="Project Name"
                value={formName}
                onChange={(e) => onNameChange(e.target.value)}
                disabled={isLoading}
                autoFocus

              />
            </div>
            {formName && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-copy-muted">
                  Project slug
                </label>
                <div className="text-sm text-copy-secondary">{slug || '-'}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!formName.trim() || isLoading}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen && dialogType === 'rename'} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Current name: <span className="font-medium">{currentName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="rename-input" className="text-sm font-medium text-copy-primary">
                New name
              </label>
              <Input
                id="rename-input"
                value={formName}
                onChange={(e) => onNameChange(e.target.value)}
                disabled={isLoading}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && formName.trim()) {
                    onSubmit()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!formName.trim() || isLoading}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpen && dialogType === 'delete'} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The project &quot;{currentName}&quot; will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onSubmit}
              disabled={isLoading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
