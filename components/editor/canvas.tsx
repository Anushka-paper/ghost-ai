'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ClientSideSuspense,
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
  useMyPresence,
  useOthers,
  useSelf,
} from '@liveblocks/react';
import { Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useLiveblocksFlow } from '@liveblocks/react-flow';
import {
  ReactFlow,
  Background,
  MiniMap,
  useReactFlow,
  useViewport,
  Node,
  Connection,
  MarkerType,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ShapePanel } from '@/components/editor/shape-panel';
import { CanvasNode } from '@/components/editor/canvas-node';
import { CanvasEdge } from '@/components/editor/canvas-edge';
import { CanvasControlBar } from '@/components/editor/canvas-control-bar';
import { StarterTemplatesModal } from '@/components/editor/starter-templates-modal';
import { useCanvasAutosave } from '@/hooks/useCanvasAutosave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  CanvasEdge as CanvasEdgeType,
  CanvasEdge as CanvasEdgeModel,
  CanvasNodeData,
  NodeColorPair,
  NODE_COLORS,
} from '@/types/canvas';

interface CanvasProps {
  roomId: string;
  isTemplateModalOpen?: boolean;
  onCloseTemplateModal?: () => void;
  onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}

const NODE_TYPES = { canvasNode: CanvasNode };
const EDGE_TYPES = { canvasEdge: CanvasEdge };
type CanvasShape = CanvasNodeData['shape'];

type LiveblocksOther = {
  connectionId: string | number;
  id?: string;
  info?: {
    name?: string;
    avatar?: string;
    cursorColor?: string;
  };
  presence?: {
    cursor: { x: number; y: number } | null;
    isThinking: boolean;
    thinking?: boolean;
  };
};

type LiveblocksUser = {
  connectionId: string | number;
  id?: string;
  info?: {
    name?: string;
    avatar?: string;
    cursorColor?: string;
  };
};

interface DraggedShape {
  shape: CanvasShape;
  size: { width: number; height: number };
  offsetX?: number;
  offsetY?: number;
}

function isCanvasShape(value: unknown): value is CanvasShape {
  return (
    value === 'rectangle' ||
    value === 'circle' ||
    value === 'diamond' ||
    value === 'pill' ||
    value === 'cylinder' ||
    value === 'hexagon'
  );
}

function parseDraggedShape(data: string): DraggedShape | null {
  try {
    const parsed = JSON.parse(data) as Partial<DraggedShape>;

    if (
      !isCanvasShape(parsed.shape) ||
      typeof parsed.size?.width !== 'number' ||
      typeof parsed.size?.height !== 'number'
    ) {
      return null;
    }

    return {
      shape: parsed.shape,
      size: {
        width: parsed.size.width,
        height: parsed.size.height,
      },
      offsetX: typeof parsed.offsetX === 'number' ? parsed.offsetX : undefined,
      offsetY: typeof parsed.offsetY === 'number' ? parsed.offsetY : undefined,
    };
  } catch {
    return null;
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function CanvasPresencePanel() {
  const { user } = useUser();
  const currentUserId = user?.id;
  const self = useSelf() as unknown as LiveblocksUser | null;
  const others = useOthers() as unknown as readonly LiveblocksOther[];
  const collaborators = others.filter(
    (other) => other.id && other.id !== currentUserId
  );

  const stackUsers = [
    ...(self ? [{ ...self, isSelf: true }] : []),
    ...collaborators.map((other) => ({ ...other, isSelf: false })),
  ];
  const visibleUsers = stackUsers.slice(0, 5);
  const overflowCount = Math.max(0, stackUsers.length - 5);
  const hasCollaborators = collaborators.length > 0;

  return (
    <div className="absolute right-4 top-4 z-40 pointer-events-none flex items-center gap-2 rounded-full border border-surface-border bg-surface/95 px-2 py-1 shadow-2xl shadow-base/30 backdrop-blur-sm">
      {visibleUsers.map((presenceUser, index) => {
        const name = presenceUser.info?.name || presenceUser.id || 'Guest';

        return (
          <div
            key={`${presenceUser.isSelf ? 'self' : 'other'}-${presenceUser.connectionId}`}
            title={presenceUser.isSelf ? `${name} (you)` : name}
            className={`relative h-9 w-9 overflow-hidden rounded-full border border-surface-border bg-surface text-xs font-semibold text-copy-primary ${
              index !== 0 ? '-ml-2' : ''
            }`}
            style={{ zIndex: 10 - index }}
          >
            {presenceUser.info?.avatar ? (
              <img
                src={presenceUser.info.avatar}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-surface text-copy-primary">
                {getInitials(name)}
              </span>
            )}
            {presenceUser.isSelf && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-surface bg-brand" />
            )}
          </div>
        );
      })}

      {overflowCount > 0 && (
        <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-surface text-xs font-semibold text-copy-primary">
          +{overflowCount}
        </div>
      )}

      {hasCollaborators && <div className="h-6 w-px bg-border-subtle" />}
    </div>
  );
}

function CanvasFlowInner({
  roomId,
  isTemplateModalOpen,
  onCloseTemplateModal,
  onSaveStatusChange,
}: {
  roomId: string;
  isTemplateModalOpen?: boolean;
  onCloseTemplateModal?: () => void;
  onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<Node<CanvasNodeData>, CanvasEdgeType>({
      suspense: true,
      storageKey: 'canvas_state',
    });
  const [hasLoadedSavedCanvas, setHasLoadedSavedCanvas] = useState(false);
  const [saveStatus, saveCanvas] = useCanvasAutosave(
    roomId,
    nodes,
    edges,
    hasLoadedSavedCanvas
  );

  useEffect(() => {
    onSaveStatusChange?.(saveStatus);
  }, [onSaveStatusChange, saveStatus]);

  useEffect(() => {
    if (hasLoadedSavedCanvas) {
      return;
    }

    if (nodes.length > 0 || edges.length > 0) {
      requestAnimationFrame(() => setHasLoadedSavedCanvas(true));
      return;
    }

    let isCancelled = false;

    const loadSavedCanvas = async () => {
      try {
        const response = await fetch(`/api/projects/${roomId}/canvas`);

        if (!response.ok) {
          setHasLoadedSavedCanvas(true);
          return;
        }

        const savedCanvas = await response.json();
        const savedNodes = Array.isArray(savedCanvas?.nodes)
          ? (savedCanvas.nodes as Node<CanvasNodeData>[])
          : [];
        const savedEdges = Array.isArray(savedCanvas?.edges)
          ? (savedCanvas.edges as CanvasEdgeModel[])
          : [];

        if (!isCancelled && savedNodes.length + savedEdges.length > 0) {
          onNodesChange(
            savedNodes.map((item) => ({ type: 'add' as const, item }))
          );
          onEdgesChange(
            savedEdges.map((item) => ({ type: 'add' as const, item }))
          );
        }
      } catch (error) {
        console.error('Error loading saved canvas:', error);
      } finally {
        if (!isCancelled) {
          setHasLoadedSavedCanvas(true);
        }
      }
    };

    void loadSavedCanvas();

    return () => {
      isCancelled = true;
    };
  }, [roomId, nodes.length, edges.length, onNodesChange, onEdgesChange, hasLoadedSavedCanvas]);
  const reactFlow = useReactFlow();
  const viewport = useViewport();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [myPresence, setMyPresence] = useMyPresence();
  const { user } = useUser();
  const currentUserId = user?.id;
  const others = useOthers() as unknown as readonly LiveblocksOther[];
  const collaborators = others.filter(
    (other) => other.id && other.id !== currentUserId
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const nodeCounterRef = useRef<Record<CanvasShape, number>>({
    rectangle: 0,
    circle: 0,
    diamond: 0,
    pill: 0,
    cylinder: 0,
    hexagon: 0,
  });

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const relativeX = event.clientX - bounds.left;
      const relativeY = event.clientY - bounds.top;
      const flowPosition = {
        x: (relativeX - viewport.x) / viewport.zoom,
        y: (relativeY - viewport.y) / viewport.zoom,
      };

      setMyPresence({
        cursor: flowPosition,
        isThinking: myPresence?.isThinking ?? false,
      });
    },
    [setMyPresence, myPresence?.isThinking, viewport.x, viewport.y, viewport.zoom]
  );

  const handleCanvasMouseLeave = useCallback(() => {
    setMyPresence({
      cursor: null,
      isThinking: myPresence?.isThinking ?? false,
    });
  }, [setMyPresence, myPresence?.isThinking]);

  const handleLabelChange = useCallback(
    (nodeId: string, label: string) => {
      const node = nodes.find((item) => item.id === nodeId);

      if (!node) {
        return;
      }

      onNodesChange([
        {
          type: 'replace',
          id: nodeId,
          item: {
            ...node,
            data: {
              ...node.data,
              label,
            },
          },
        },
      ]);
    },
    [nodes, onNodesChange]
  );

  const handleColorChange = useCallback(
    (nodeId: string, color: NodeColorPair) => {
      const node = nodes.find((item) => item.id === nodeId);

      if (!node) {
        return;
      }

      onNodesChange([
        {
          type: 'replace',
          id: nodeId,
          item: {
            ...node,
            data: {
              ...node.data,
              color: color.fill,
              textColor: color.text,
            },
          },
        },
      ]);
    },
    [nodes, onNodesChange]
  );

  const handleEdgeLabelChange = useCallback(
    (edgeId: string, label: string) => {
      const edge = edges.find((item) => item.id === edgeId);

      if (!edge) {
        return;
      }

      onEdgesChange([
        {
          type: 'replace',
          id: edgeId,
          item: {
            ...edge,
            data: {
              ...edge.data,
              label,
            },
          },
        },
      ]);
    },
    [edges, onEdgesChange]
  );

  const renderedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onLabelChange: handleLabelChange,
          onColorChange: handleColorChange,
        },
      })),
    [handleColorChange, handleLabelChange, nodes]
  );

  const renderedEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: 'canvasEdge' as const,
        data: {
          ...edge.data,
          onLabelChange: handleEdgeLabelChange,
        },
      })),
    [edges, handleEdgeLabelChange]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      onEdgesChange([
        {
          type: 'add',
          item: {
            ...connection,
            id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
            type: 'canvasEdge',
            data: {
              label: '',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'var(--text-secondary)',
            },
          },
        },
      ]);
    },
    [onEdgesChange]
  );

  const handleZoomOut = useCallback(() => {
    void reactFlow.zoomOut({ duration: 180 });
  }, [reactFlow]);

  const handleFitView = useCallback(() => {
    void reactFlow.fitView({ duration: 220, padding: 0.2 });
  }, [reactFlow]);

  const handleZoomIn = useCallback(() => {
    void reactFlow.zoomIn({ duration: 180 });
  }, [reactFlow]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
    }
  }, [canRedo, redo]);

  useKeyboardShortcuts({
    reactFlow,
    undo: handleUndo,
    redo: handleRedo,
  });

  const isEditableTarget = (target: EventTarget | null) => {
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
  };

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }

      const selectedNodeRemovals = nodes
        .filter((node) => node.selected)
        .map((node) => ({ type: 'remove' as const, id: node.id }));

      const selectedEdgeRemovals = edges
        .filter((edge) => edge.selected)
        .map((edge) => ({ type: 'remove' as const, id: edge.id }));

      if (selectedNodeRemovals.length > 0) {
        onNodesChange(selectedNodeRemovals);
      }

      if (selectedEdgeRemovals.length > 0) {
        onEdgesChange(selectedEdgeRemovals);
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [edges, nodes, onEdgesChange, onNodesChange]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(false);

      const shapeData = parseDraggedShape(
        event.dataTransfer.getData('application/json') ||
          event.dataTransfer.getData('text/plain')
      );

      if (!shapeData) {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();
      const relativeX = event.clientX - bounds.left;
      const relativeY = event.clientY - bounds.top;

      const centerScreenX =
        relativeX - (shapeData.offsetX ?? shapeData.size.width / 2) +
        shapeData.size.width / 2;
      const centerScreenY =
        relativeY - (shapeData.offsetY ?? shapeData.size.height / 2) +
        shapeData.size.height / 2;

      const centerFlowX = (centerScreenX - viewport.x) / viewport.zoom;
      const centerFlowY = (centerScreenY - viewport.y) / viewport.zoom;

      const flowPosition = {
        x: centerFlowX - shapeData.size.width / 2 / viewport.zoom,
        y: centerFlowY - shapeData.size.height / 2 / viewport.zoom,
      };

      const count = nodeCounterRef.current[shapeData.shape] + 1;
      nodeCounterRef.current[shapeData.shape] = count;

      onNodesChange([
        {
          type: 'add',
          item: {
            id: `${shapeData.shape}-${Date.now()}-${count}`,
            type: 'canvasNode',
            data: {
              label: 'Node',
              color: NODE_COLORS[0].fill,
              textColor: NODE_COLORS[0].text,
              shape: shapeData.shape,
            },
            position: flowPosition,
            style: {
              width: shapeData.size.width,
              height: shapeData.size.height,
            },
          },
        },
      ]);
    },
    [onNodesChange, viewport.x, viewport.y, viewport.zoom]
  );

  return (
    <div
      className="relative h-full w-full"
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={handleCanvasMouseLeave}
    >
      <ReactFlow
        className="bg-base"
        nodes={renderedNodes}
        edges={renderedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDelete={onDelete}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connectionMode={'loose' as any}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        defaultEdgeOptions={{
          type: 'canvasEdge',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'var(--text-secondary)',
          },
        }}
      >
        {isDraggingOver && (
          <div className="pointer-events-none absolute inset-0 z-10 bg-accent-dim" />
        )}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Background variant={'dots' as any} gap={24} size={1.5} color="var(--border-subtle)" />
        <MiniMap
          maskColor="rgba(8, 8, 9, 0.72)"
          nodeColor="var(--accent-primary)"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
          }}
        />
        <CanvasControlBar
          canUndo={canUndo}
          canRedo={canRedo}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onZoomIn={handleZoomIn}
          onUndo={handleUndo}
          onRedo={handleRedo}
          saveStatus={saveStatus}
        />
        <ShapePanel onShapeDragStart={() => {}} />
        <StarterTemplatesModal 
          isOpen={!!isTemplateModalOpen} 
          onClose={() => onCloseTemplateModal?.()} 
          onImport={(template) => {
            onNodesChange(nodes.map(n => ({ type: 'remove', id: n.id })));
            onEdgesChange(edges.map(e => ({ type: 'remove', id: e.id })));
            
            onNodesChange(template.nodes.map(n => ({ type: 'add', item: n })));
            onEdgesChange(template.edges.map(e => ({ type: 'add', item: e })));
            
            requestAnimationFrame(() => {
              reactFlow.fitView({ padding: 0.2, duration: 400 });
            });
          }}
        />
      </ReactFlow>

      <CanvasPresencePanel />

      {collaborators.map((other) => {
        const userInfo = other.info;

        if (!other.presence?.cursor || !other.id) {
          return null;
        }

        const cursorX = other.presence.cursor.x * viewport.zoom + viewport.x;
        const cursorY = other.presence.cursor.y * viewport.zoom + viewport.y;

        const isThinking = other.presence?.isThinking || other.presence?.thinking;

        return (
          <div
            key={String(other.connectionId)}
            className="pointer-events-none absolute z-30"
            style={{
              left: cursorX,
              top: cursorY,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="flex items-center gap-2 rounded-full bg-surface/95 px-2 py-1 text-xs font-medium text-copy-primary shadow-lg shadow-black/10">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: userInfo?.cursorColor || '#4ECDC4' }}
              />
              <span>{userInfo?.name || 'Guest'}</span>
              {isThinking && <Loader2 className="h-3 w-3 animate-spin text-accent" />}
            </div>
            <div
              className="mx-auto mt-1 h-2 w-2 rounded-full"
              style={{ backgroundColor: userInfo?.cursorColor || '#4ECDC4' }}
            />
          </div>
        );
      })}
    </div>
  );
}

function CanvasFlow({
  roomId,
  isTemplateModalOpen,
  onCloseTemplateModal,
  onSaveStatusChange,
}: {
  roomId: string;
  isTemplateModalOpen?: boolean;
  onCloseTemplateModal?: () => void;
  onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}) {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner
        roomId={roomId}
        isTemplateModalOpen={isTemplateModalOpen}
        onCloseTemplateModal={onCloseTemplateModal}
        onSaveStatusChange={onSaveStatusChange}
      />
    </ReactFlowProvider>
  );
}

function CanvasContentInner({
  roomId,
  isTemplateModalOpen,
  onCloseTemplateModal,
  onSaveStatusChange,
}: {
  roomId: string;
  isTemplateModalOpen?: boolean;
  onCloseTemplateModal?: () => void;
  onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}) {
  return (
    <CanvasFlow
      roomId={roomId}
      isTemplateModalOpen={isTemplateModalOpen}
      onCloseTemplateModal={onCloseTemplateModal}
      onSaveStatusChange={onSaveStatusChange}
    />
  );
}

function CanvasContent({
  roomId,
  isTemplateModalOpen,
  onCloseTemplateModal,
  onSaveStatusChange,
}: {
  roomId: string;
  isTemplateModalOpen?: boolean;
  onCloseTemplateModal?: () => void;
  onSaveStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}) {
  return (
    <CanvasContentInner
      roomId={roomId}
      isTemplateModalOpen={isTemplateModalOpen}
      onCloseTemplateModal={onCloseTemplateModal}
      onSaveStatusChange={onSaveStatusChange}
    />
  );
}

function CanvasLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base">
      <div className="text-center">
        <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border border-surface-border border-t-brand" />
        <p className="text-sm text-copy-muted">Loading canvas...</p>
      </div>
    </div>
  );
}

export function Canvas({
  roomId,
  isTemplateModalOpen,
  onCloseTemplateModal,
  onSaveStatusChange,
}: CanvasProps) {
  return (
    <ClientSideSuspense fallback={<CanvasLoading />}>
      <CanvasContent
        roomId={roomId}
        isTemplateModalOpen={isTemplateModalOpen}
        onCloseTemplateModal={onCloseTemplateModal}
        onSaveStatusChange={onSaveStatusChange}
      />
    </ClientSideSuspense>
  );
}
