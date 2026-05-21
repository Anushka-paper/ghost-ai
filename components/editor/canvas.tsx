'use client';

import { useState, useCallback, useRef } from 'react';
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from '@liveblocks/react';
import { useLiveblocksFlow } from '@liveblocks/react-flow';
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  useReactFlow,
  Node,
  Edge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ShapePanel } from '@/components/editor/shape-panel';
import { CanvasNode } from '@/components/editor/canvas-node';
import { CanvasNodeData } from '@/types/canvas';

interface CanvasProps {
  roomId: string;
}

const NODE_TYPES = { canvasNode: CanvasNode };
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

function CanvasFlowInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<Node<CanvasNodeData>, Edge>({
      suspense: true,
      storageKey: 'canvas_state',
    });
  const { screenToFlowPosition } = useReactFlow();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const nodeCounterRef = useRef<Record<CanvasShape, number>>({
    rectangle: 0,
    circle: 0,
    diamond: 0,
    pill: 0,
    cylinder: 0,
    hexagon: 0,
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
              color: '#1F1F1F',
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
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      fitView
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      connectionMode={'loose' as any}
      nodeTypes={NODE_TYPES}
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
      <Controls />
      <ShapePanel onShapeDragStart={() => {}} />
    </ReactFlow>
  );
}

function CanvasFlow() {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner />
    </ReactFlowProvider>
  );
}

function CanvasContentInner() {
  return <CanvasFlow />;
}

function CanvasContent() {
  return <CanvasContentInner />;
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

export function Canvas({ roomId }: CanvasProps) {
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
          <CanvasContent />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
