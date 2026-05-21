'use client';

import {
  Square,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShapePanelProps {
  onShapeDragStart: (
    shape: 'rectangle' | 'circle' | 'diamond' | 'pill' | 'cylinder' | 'hexagon',
    size: { width: number; height: number }
  ) => void;
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
  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    shape: 'rectangle' | 'circle' | 'diamond' | 'pill' | 'cylinder' | 'hexagon',
    size: { width: number; height: number }
  ) => {
    const shapeData = JSON.stringify({ shape, size });
    e.dataTransfer.setData('application/json', shapeData);
    e.dataTransfer.setData('text/plain', shapeData);
    e.dataTransfer.effectAllowed = 'move';
    onShapeDragStart(shape, size);
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
            onDragStart={(e) =>
              handleDragStart(
                e,
                id as
                  | 'rectangle'
                  | 'circle'
                  | 'diamond'
                  | 'pill'
                  | 'cylinder'
                  | 'hexagon',
                size
              )
            }
          >
            <Icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
    </div>
  );
}
