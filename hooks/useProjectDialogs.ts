import { useState } from 'react'

type DialogType = 'create' | 'rename' | 'delete' | null
type ProjectId = string

interface DialogState {
  type: DialogType
  projectId?: ProjectId
  projectName?: string
}

interface FormState {
  name: string
}

export function useProjectDialogs() {
  const [dialog, setDialog] = useState<DialogState>({ type: null })
  const [form, setForm] = useState<FormState>({ name: '' })
  const [isLoading, setIsLoading] = useState(false)

  const openCreateDialog = () => {
    setDialog({ type: 'create' })
    setForm({ name: '' })
    setIsLoading(false)
  }

  const openRenameDialog = (projectId: ProjectId, currentName: string) => {
    setDialog({ type: 'rename', projectId })
    setForm({ name: currentName })
    setIsLoading(false)
  }

  const openDeleteDialog = (projectId: ProjectId) => {
    setDialog({ type: 'delete', projectId, projectName: '' })
    setForm({ name: '' })
    setIsLoading(false)
  }

  const closeDialog = () => {
    setDialog({ type: null })
    setForm({ name: '' })
    setIsLoading(false)
  }

  const updateFormName = (name: string) => {
    setForm({ name })
  }

  const setFormLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  return {
    dialog,
    form,
    isLoading,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    updateFormName,
    setFormLoading,
  }
}
