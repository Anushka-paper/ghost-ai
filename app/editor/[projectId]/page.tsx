import { redirect } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';
import {
  getCurrentUser,
  getProjectWithAccess,
} from '@/lib/project-access';
import { getProjectsForUser } from '@/lib/project-helpers';
import { WorkspaceShell } from '@/components/editor/workspace-shell';
import { AccessDenied } from '@/components/editor/access-denied';

export const dynamic = 'force-dynamic';

interface WorkspacePageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function WorkspacePage({
  params,
}: WorkspacePageProps) {
  const { projectId } = await params;

  // Check if user is authenticated
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // Get current user with email
  const user = await getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Check if project exists and user has access
  const project = await getProjectWithAccess(projectId, user);
  if (!project) {
    return <AccessDenied />;
  }

  // Fetch all projects for the sidebar
  const { ownedProjects, sharedProjects } =
    await getProjectsForUser();

  // Determine if current user is the project owner
  const isOwner = project.ownerId === userId;

  return (
    <WorkspaceShell
      projectId={projectId}
      projectName={project.name}
      isOwner={isOwner}
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    />
  );
}
