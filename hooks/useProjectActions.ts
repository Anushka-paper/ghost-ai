'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type DialogType = 'create' | 'rename' | 'delete' | null

interface DialogState {
  type: DialogType
  projectId?: string
  projectName?: string
}

interface FormState {
  name: string
}

export function useProjectActions() {
  const router = useRouter()
  const [dialog, setDialog] = useState<DialogState>({ type: null })
  const [form, setForm] = useState<FormState>({ name: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cleanup = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
    }
  }, [])

  const openCreateDialog = useCallback(() => {
    setDialog({ type: 'create' })
    setForm({ name: '' })
    setError(null)
    setIsLoading(false)
  }, [])

  const openRenameDialog = useCallback((projectId: string, currentName: string) => {
    setDialog({ type: 'rename', projectId, projectName: currentName })
    setForm({ name: currentName })
    setError(null)
    setIsLoading(false)
  }, [])

  const openDeleteDialog = useCallback((projectId: string, projectName: string) => {
    setDialog({ type: 'delete', projectId, projectName })
    setForm({ name: '' })
    setError(null)
    setIsLoading(false)
  }, [])

  const closeDialog = useCallback(() => {
    setDialog({ type: null })
    setForm({ name: '' })
    setError(null)
    setIsLoading(false)
  }, [])

  const updateFormName = useCallback((name: string) => {
    setForm({ name })
    setError(null)
  }, [])

  const handleCreate = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Project name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create project')
      }

      const project = await response.json()
      closeDialog()
      // Navigate to the new workspace
      router.push(`/editor/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [form.name, closeDialog, router])

  const handleRename = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Project name is required')
      return
    }

    if (!dialog.projectId) {
      setError('No project selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${dialog.projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to rename project')
      }

      closeDialog()
      // Refresh the page to show updated data
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [form.name, dialog.projectId, closeDialog, router])

  const handleDelete = useCallback(async () => {
    if (!dialog.projectId) {
      setError('No project selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${dialog.projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete project')
      }

      closeDialog()
      router.replace('/editor')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [dialog.projectId, closeDialog, router])

  const handleSubmit = useCallback(async () => {
    if (dialog.type === 'create') {
      await handleCreate()
    } else if (dialog.type === 'rename') {
      await handleRename()
    } else if (dialog.type === 'delete') {
      await handleDelete()
    }
  }, [dialog.type, handleCreate, handleRename, handleDelete])

  return {
    dialog,
    form,
    isLoading,
    error,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    updateFormName,
    handleSubmit,
    cleanup,
  }
}
