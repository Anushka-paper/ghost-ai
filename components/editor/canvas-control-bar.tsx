'use client';

import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasControlBarProps {
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onZoomOut: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function CanvasControlBar({
  canUndo,
  canRedo,
  saveStatus,
  onZoomOut,
  onFitView,
  onZoomIn,
  onUndo,
  onRedo,
}: CanvasControlBarProps) {
  const buttonClass =
    'h-9 w-9 p-0 text-copy-secondary hover:bg-subtle hover:text-copy-primary disabled:pointer-events-none disabled:opacity-35';

  return (
    <div className="absolute bottom-6 left-6 z-20">
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 px-2 py-1.5 shadow-2xl shadow-base/60 backdrop-blur">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={buttonClass}
            title="Zoom out"
            aria-label="Zoom out"
            onClick={onZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={buttonClass}
            title="Fit view"
            aria-label="Fit view"
            onClick={onFitView}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={buttonClass}
            title="Zoom in"
            aria-label="Zoom in"
            onClick={onZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="mx-1 h-6 w-px bg-border-subtle" />
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={buttonClass}
            title="Undo"
            aria-label="Undo"
            disabled={!canUndo}
            onClick={onUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={buttonClass}
            title="Redo"
            aria-label="Redo"
            disabled={!canRedo}
            onClick={onRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="ml-2 flex items-center rounded-full bg-surface px-2 py-1 text-xs font-medium text-copy-muted">
          {saveStatus === 'saving' && 'Saving…'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Save failed'}
          {saveStatus === 'idle' && 'Autosave idle'}
        </div>
      </div>
    </div>
  );
}
