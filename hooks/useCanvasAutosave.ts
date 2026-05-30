'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Edge, Node } from '@xyflow/react';
import { CanvasEdgeData, CanvasNodeData } from '@/types/canvas';

export type CanvasSaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type CanvasSaveFunction = () => Promise<void>;

export function useCanvasAutosave(
  projectId: string,
  nodes: Node<CanvasNodeData>[],
  edges: Edge<CanvasEdgeData>[],
  hasLoadedSavedCanvas: boolean
): [CanvasSaveStatus, CanvasSaveFunction] {
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>('idle');
  const debounceRef = useRef<number | null>(null);
  const statusResetRef = useRef<number | null>(null);
  const hasSavedAtLeastOnce = useRef(false);

  const saveCanvas = useCallback(async () => {
    if (!hasLoadedSavedCanvas) {
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    setSaveStatus('saving');

    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error('Failed to save canvas');
      }

      hasSavedAtLeastOnce.current = true;
      setSaveStatus('saved');
    } catch (error) {
      console.error('Canvas autosave failed:', error);
      setSaveStatus('error');
      throw error;
    }
  }, [projectId, nodes, edges, hasLoadedSavedCanvas]);

  useEffect(() => {
    if (!hasLoadedSavedCanvas) {
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (nodes.length === 0 && edges.length === 0 && !hasSavedAtLeastOnce.current) {
      setSaveStatus('idle');
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      void saveCanvas();
    }, 700);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [projectId, nodes, edges, hasLoadedSavedCanvas, saveCanvas]);

  useEffect(() => {
    if (statusResetRef.current) {
      window.clearTimeout(statusResetRef.current);
      statusResetRef.current = null;
    }

    if (saveStatus === 'saved' || saveStatus === 'error') {
      statusResetRef.current = window.setTimeout(() => {
        setSaveStatus('idle');
      }, 1400);
    }

    return () => {
      if (statusResetRef.current) {
        window.clearTimeout(statusResetRef.current);
        statusResetRef.current = null;
      }
    };
  }, [saveStatus]);

  return [saveStatus, saveCanvas];
}
