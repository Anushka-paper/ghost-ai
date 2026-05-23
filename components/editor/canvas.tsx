'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
} from '@liveblocks/react';
import { useLiveblocksFlow } from '@liveblocks/react-flow';
import {
  ReactFlow,
  Background,
  MiniMap,
  useReactFlow,
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
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  CanvasEdge as CanvasEdgeType,
  CanvasNodeData,
  NodeColorPair,
  NODE_COLORS,
} from '@/types/canvas';

interface CanvasProps {
  roomId: string;
  isTemplateModalOpen?: boolean;
  onCloseTemplateModal?: () => void;
}

const NODE_TYPES = { canvasNode: CanvasNode };
const EDGE_TYPES = { canvasEdge: CanvasEdge };
type CanvasShape = CanvasNodeData['shape'];

interface DraggedShape {
  shape: CanvasShape;
  size: { width: number; height: number };
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
    };
  } catch {
    return null;
  }
}

function CanvasFlowInner({ isTemplateModalOpen, onCloseTemplateModal }: { isTemplateModalOpen?: boolean, onCloseTemplateModal?: () => void }) {
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<Node<CanvasNodeData>, CanvasEdgeType>({
      suspense: true,
      storageKey: 'canvas_state',
    });
  const reactFlow = useReactFlow();
  const { screenToFlowPosition } = reactFlow;
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const nodeCounterRef = useRef<Record<CanvasShape, number>>({
    rectangle: 0,
    circle: 0,
    diamond: 0,
    pill: 0,
    cylinder: 0,
    hexagon: 0,
  });

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
            position: screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            }),
            style: {
              width: shapeData.size.width,
              height: shapeData.size.height,
            },
          },
        },
      ]);
    },
    [onNodesChange, screenToFlowPosition]
  );

  return (
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
      fitView
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
      />
      <ShapePanel onShapeDragStart={() => {}} />
      <StarterTemplatesModal 
        isOpen={!!isTemplateModalOpen} 
        onClose={() => onCloseTemplateModal?.()} 
        onImport={(template) => {
          onNodesChange(nodes.map(n => ({ type: 'remove', id: n.id })));
          onEdgesChange(edges.map(e => ({ type: 'remove', id: e.id })));
          
          setTimeout(() => {
            onNodesChange(template.nodes.map(n => ({ type: 'add', item: n })));
            onEdgesChange(template.edges.map(e => ({ type: 'add', item: e })));
            setTimeout(() => {
              reactFlow.fitView({ padding: 0.2, duration: 400 });
            }, 50);
          }, 50);
        }}
      />
    </ReactFlow>
  );
}

function CanvasFlow({ isTemplateModalOpen, onCloseTemplateModal }: { isTemplateModalOpen?: boolean, onCloseTemplateModal?: () => void }) {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner isTemplateModalOpen={isTemplateModalOpen} onCloseTemplateModal={onCloseTemplateModal} />
    </ReactFlowProvider>
  );
}

function CanvasContentInner({ isTemplateModalOpen, onCloseTemplateModal }: { isTemplateModalOpen?: boolean, onCloseTemplateModal?: () => void }) {
  return <CanvasFlow isTemplateModalOpen={isTemplateModalOpen} onCloseTemplateModal={onCloseTemplateModal} />;
}

function CanvasContent({ isTemplateModalOpen, onCloseTemplateModal }: { isTemplateModalOpen?: boolean, onCloseTemplateModal?: () => void }) {
  return <CanvasContentInner isTemplateModalOpen={isTemplateModalOpen} onCloseTemplateModal={onCloseTemplateModal} />;
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

export function Canvas({ roomId, isTemplateModalOpen, onCloseTemplateModal }: CanvasProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          isThinking: false,
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialStorage={{} as any}
      >
        <ClientSideSuspense fallback={<CanvasLoading />}>
          <CanvasContent isTemplateModalOpen={isTemplateModalOpen} onCloseTemplateModal={onCloseTemplateModal} />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
