'use client';

import { useState } from 'react';
import { Share2, MessageSquare, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProjectSidebar } from '@/components/editor/project-sidebar';
import { ProjectDialogs } from '@/components/editor/project-dialogs';
import { ShareDialog } from '@/components/editor/share-dialog';
import { Canvas } from '@/components/editor/canvas';
import { useProjectActions } from '@/hooks/useProjectActions';

interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
}

interface WorkspaceShellProps {
  projectId: string;
  projectName: string;
  isOwner: boolean;
  ownedProjects: Project[];
  sharedProjects: Project[];
}

export function WorkspaceShell({
  projectId,
  projectName,
  isOwner,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const projectActions = useProjectActions();

  return (
    <div className="flex min-h-screen flex-col bg-base text-copy-primary">
      {/* Top Navbar */}
      <div className="relative z-50 flex h-14 items-center gap-4 border-b border-surface-border bg-surface px-4">
        <div className="flex flex-1 items-center gap-3">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsProjectSidebarOpen((isOpen) => !isOpen)}
            className="h-9 w-9 p-0"
          >
            {isProjectSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>

          {/* Project Name */}
          <h1 className="text-sm font-semibold text-copy-primary">{projectName}</h1>
        </div>

        {/* Navbar Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setIsShareDialogOpen(true)}
            title="Share project"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setIsAiSidebarOpen((isOpen) => !isOpen)}
            title="Toggle AI sidebar"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative flex-1 overflow-hidden bg-base">
        {/* Project Sidebar */}
        <ProjectSidebar
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          isOpen={isProjectSidebarOpen}
          onClose={() => setIsProjectSidebarOpen(false)}
          currentProjectId={projectId}
          onOpenCreateDialog={projectActions.openCreateDialog}
          onOpenRenameDialog={projectActions.openRenameDialog}
          onOpenDeleteDialog={projectActions.openDeleteDialog}
        />

        {/* Canvas Area */}
        <div className="absolute inset-0">
          <Canvas roomId={projectId} />
        </div>

        {/* AI Sidebar Placeholder */}
        <aside
          aria-hidden={!isAiSidebarOpen}
          className={`fixed right-3 top-17 z-40 flex h-[calc(100vh-5rem)] w-80 max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border border-surface-border bg-surface/95 p-4 shadow-2xl shadow-base/60 backdrop-blur transition-transform duration-200 ease-out ${
            isAiSidebarOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1.5rem)]'
          }`}
        >
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-copy-muted">AI sidebar coming soon</p>
          </div>
        </aside>
      </main>

      {/* Project Dialogs */}
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

      {/* Share Dialog */}
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        projectId={projectId}
        projectName={projectName}
        isOwner={isOwner}
      />
    </div>
  );
}
