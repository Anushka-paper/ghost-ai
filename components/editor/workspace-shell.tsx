'use client';

import { useState } from 'react';
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react';
import { Share2, MessageSquare, PanelLeftOpen, PanelLeftClose } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProjectSidebar } from '@/components/editor/project-sidebar';
import { ProjectDialogs } from '@/components/editor/project-dialogs';
import { ShareDialog } from '@/components/editor/share-dialog';
import { Canvas } from '@/components/editor/canvas';
import { AiSidebar } from '@/components/editor/ai-sidebar';
import { useProjectActions } from '@/hooks/useProjectActions';
import type { CanvasSaveStatus } from '@/hooks/useCanvasAutosave';

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

function WorkspaceShellInner({
  projectId,
  projectName,
  isOwner,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [isProjectSidebarOpen, setIsProjectSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>('idle');
  const projectActions = useProjectActions();

  const handleSaveStatusChange = (status: CanvasSaveStatus) => {
    setSaveStatus(status);
  };

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
            className="rounded-xl px-4 text-xs font-medium"
            onClick={() => setIsTemplateModalOpen(true)}
          >
            Templates
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => setIsShareDialogOpen(true)}
            title="Share project"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-xl transition-colors ${isAiSidebarOpen ? "bg-subtle text-brand" : ""}`}
            onClick={() => setIsAiSidebarOpen((isOpen) => !isOpen)}
            title="Toggle AI sidebar"
          >
            <MessageSquare className="h-4 w-4" />
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
          <Canvas
            roomId={projectId}
            isTemplateModalOpen={isTemplateModalOpen}
            onCloseTemplateModal={() => setIsTemplateModalOpen(false)}
            onSaveStatusChange={handleSaveStatusChange}
          />
        </div>

        <AiSidebar isOpen={isAiSidebarOpen} onClose={() => setIsAiSidebarOpen(false)} projectId={projectId} />
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

export function WorkspaceShell(props: WorkspaceShellProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      <RoomProvider
        id={props.projectId}
        initialPresence={{
          cursor: null,
          isThinking: false,
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialStorage={{} as any}
      >
        <WorkspaceShellInner {...props} />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
