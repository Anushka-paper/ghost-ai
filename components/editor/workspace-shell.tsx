'use client';

import { useState } from 'react';
import { Share2, MessageSquare, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProjectSidebar } from '@/components/editor/project-sidebar';
import { ProjectDialogs } from '@/components/editor/project-dialogs';
import { ShareDialog } from '@/components/editor/share-dialog';
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
    <div className="flex min-h-screen flex-col bg-ghost-900 text-ghost-50">
      {/* Top Navbar */}
      <div className="flex h-14 items-center gap-4 border-b border-ghost-800 bg-ghost-950 px-4">
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
          <h1 className="text-sm font-semibold text-ghost-50">{projectName}</h1>
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
      <main className="relative flex flex-1 overflow-hidden">
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
        <div className="flex flex-1 flex-col items-center justify-center bg-ghost-900">
          <div className="max-w-md space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-ghost-50">
                Canvas Coming Soon
              </h2>
              <p className="text-sm leading-6 text-ghost-300">
                The collaborative canvas will be built here.
              </p>
            </div>
          </div>
        </div>

        {/* AI Sidebar Placeholder */}
        {isAiSidebarOpen && (
          <div className="w-80 border-l border-ghost-800 bg-ghost-950 p-4">
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-ghost-400">
                AI sidebar coming soon
              </p>
            </div>
          </div>
        )}
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
