'use client';

import { useState, useCallback, useEffect, type FormEvent } from 'react';
import { Copy, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Collaborator {
  email: string;
  displayName?: string;
  avatarUrl?: string | null;
  createdAt: Date;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  isOwner: boolean;
}

export function ShareDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
  isOwner,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingCollaborators, setIsLoadingCollaborators] =
    useState(false);
  const projectLink =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}/editor/${projectId}`;

  const fetchCollaborators = useCallback(async () => {
    try {
      setIsLoadingCollaborators(true);
      const response = await fetch(
        `/api/projects/${projectId}/collaborators`
      );

      if (!response.ok) {
        setError('Failed to load collaborators');
        return;
      }

      const data = await response.json();
      setCollaborators(data.collaborators);
    } catch (err) {
      console.error('Error fetching collaborators:', err);
      setError('Failed to load collaborators');
    } finally {
      setIsLoadingCollaborators(false);
    }
  }, [projectId]);

  // Fetch collaborators when the dialog opens.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void fetchCollaborators();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchCollaborators, isOpen]);

  const handleInvite = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!inviteEmail.trim()) return;

      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(
          `/api/projects/${projectId}/collaborators`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inviteEmail.trim() }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          setError(
            data.error || 'Failed to invite collaborator'
          );
          return;
        }

        setInviteEmail('');
        await fetchCollaborators();
      } catch (err) {
        console.error('Error inviting collaborator:', err);
        setError('Failed to invite collaborator');
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, inviteEmail, fetchCollaborators]
  );

  const handleRemove = useCallback(
    async (email: string) => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(
          `/api/projects/${projectId}/collaborators/${encodeURIComponent(email)}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          setError('Failed to remove collaborator');
          return;
        }

        await fetchCollaborators();
      } catch (err) {
        console.error('Error removing collaborator:', err);
        setError('Failed to remove collaborator');
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, fetchCollaborators]
  );

  const handleCopyLink = useCallback(async () => {
    if (!projectLink) return;

    try {
      await navigator.clipboard.writeText(projectLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  }, [projectLink]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-surface text-copy-primary">
        <DialogHeader>
          <DialogTitle>Share &quot;{projectName}&quot;</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-copy-muted">
              Project Link
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                readOnly
                value={projectLink}
                className="bg-base text-copy-primary"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Invite Section (Owner Only) */}
          {isOwner && (
            <div className="space-y-3 border-t border-surface-border pt-6">
              <label className="text-xs font-medium text-copy-muted">
                Invite Collaborators
              </label>
              <form onSubmit={handleInvite} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-base text-copy-primary"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inviteEmail.trim()}
                  size="sm"
                >
                  Invite
                </Button>
              </form>
              {error && (
                <p className="text-xs text-state-error">{error}</p>
              )}
            </div>
          )}

          {/* Collaborators Section */}
          <div className="space-y-3 border-t border-surface-border pt-6">
            <label className="text-xs font-medium text-copy-muted">
              Collaborators ({collaborators.length})
            </label>
            {isLoadingCollaborators ? (
              <p className="text-xs text-copy-muted">Loading...</p>
            ) : collaborators.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.email}
                    className="flex items-center justify-between rounded-lg bg-base p-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {collaborator.avatarUrl && (
                        <img
                          src={collaborator.avatarUrl}
                          alt={collaborator.displayName}
                          className="h-6 w-6 rounded-full flex-shrink-0"
                        />
                      )}
                        <div className="min-w-0">
                        {collaborator.displayName && (
                          <p className="text-xs font-medium text-copy-primary truncate">
                            {collaborator.displayName}
                          </p>
                        )}
                        <p className="text-xs text-copy-muted truncate">
                          {collaborator.email}
                        </p>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemove(collaborator.email)
                        }
                        disabled={isLoading}
                        className="rounded p-1 text-copy-muted hover:bg-subtle hover:text-state-error flex-shrink-0"
                        aria-label={`Remove ${collaborator.email}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-copy-muted">
                No collaborators yet
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
