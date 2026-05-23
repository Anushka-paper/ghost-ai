'use client';

import { useEffect } from 'react';
import { ReactFlowInstance } from '@xyflow/react';

interface UseKeyboardShortcutsOptions {
  reactFlow: ReactFlowInstance;
  undo: () => void;
  redo: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    target.isContentEditable ||
    target.closest('[contenteditable="true"]') !== null
  );
}

export function useKeyboardShortcuts({
  reactFlow,
  undo,
  redo,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const hasCommandModifier = event.metaKey || event.ctrlKey;

      if (hasCommandModifier && key === 'z') {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }

        return;
      }

      if (hasCommandModifier && key === 'y') {
        event.preventDefault();
        redo();
        return;
      }

      if (!hasCommandModifier && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        void reactFlow.zoomIn({ duration: 180 });
        return;
      }

      if (!hasCommandModifier && event.key === '-') {
        event.preventDefault();
        void reactFlow.zoomOut({ duration: 180 });
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [reactFlow, redo, undo]);
}
