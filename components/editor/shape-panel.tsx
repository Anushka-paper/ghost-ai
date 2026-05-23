'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Square,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NodeShape } from '@/components/editor/node-shape';
import { CanvasNodeData } from '@/types/canvas';

type CanvasShape = CanvasNodeData['shape'];

interface ShapeSize {
  width: number;
  height: number;
}

interface ShapePanelProps {
  onShapeDragStart: (
    shape: CanvasShape,
    size: ShapeSize
  ) => void;
}

interface DragPreview {
  shape: CanvasShape;
  size: ShapeSize;
  x: number;
  y: number;
}

const shapes = [
  {
    id: 'rectangle',
    icon: Square,
    label: 'Rectangle',
    size: { width: 200, height: 120 },
  },
  {
    id: 'diamond',
    icon: Diamond,
    label: 'Diamond',
    size: { width: 140, height: 140 },
  },
  {
    id: 'circle',
    icon: Circle,
    label: 'Circle',
    size: { width: 120, height: 120 },
  },
  {
    id: 'pill',
    icon: Pill,
    label: 'Pill',
    size: { width: 180, height: 100 },
  },
  {
    id: 'cylinder',
    icon: Cylinder,
    label: 'Cylinder',
    size: { width: 140, height: 160 },
  },
  {
    id: 'hexagon',
    icon: Hexagon,
    label: 'Hexagon',
    size: { width: 140, height: 140 },
  },
] as const;

export function ShapePanel({ onShapeDragStart }: ShapePanelProps) {
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const dragImageRef = useRef<HTMLCanvasElement | null>(null);

  const isDraggingRef = useRef(false);

  useEffect(() => {
    function handleWindowDragOver(event: DragEvent) {
      if (isDraggingRef.current) {
        setDragPreview((current) =>
          current ? { ...current, x: event.clientX, y: event.clientY } : null
        );
      }
    }

    function clearDragPreview() {
      isDraggingRef.current = false;
      setDragPreview(null);
    }

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', clearDragPreview);
    window.addEventListener('dragend', clearDragPreview);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', clearDragPreview);
      window.removeEventListener('dragend', clearDragPreview);
    };
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    shape: CanvasShape,
    size: ShapeSize
  ) => {
    isDraggingRef.current = true;
    const shapeData = JSON.stringify({ shape, size });
    e.dataTransfer.setData('application/json', shapeData);
    e.dataTransfer.setData('text/plain', shapeData);
    e.dataTransfer.effectAllowed = 'move';

    if (!dragImageRef.current) {
      dragImageRef.current = document.createElement('canvas');
      dragImageRef.current.width = 1;
      dragImageRef.current.height = 1;
    }

    e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    setDragPreview({ shape, size, x: e.clientX, y: e.clientY });
    onShapeDragStart(shape, size);
  };

  const handleDragEnd = () => {
    setDragPreview(null);
  };

  return (
    <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-surface-border bg-surface/95 px-3 py-2 shadow-2xl shadow-base/60 backdrop-blur">
        {shapes.map(({ id, icon: Icon, label, size }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-subtle"
            title={label}
            draggable
            onDragEnd={handleDragEnd}
            onDragStart={(e) =>
              handleDragStart(
                e,
                id,
                size
              )
            }
          >
            <Icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
      {dragPreview && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: dragPreview.x,
            top: dragPreview.y,
            width: dragPreview.size.width,
            height: dragPreview.size.height,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <NodeShape shape={dragPreview.shape} fill="#1F1F1F" preview />
        </div>
      )}
    </div>
  );
}
