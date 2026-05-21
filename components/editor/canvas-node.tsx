'use client';

import { Handle, Position } from '@xyflow/react';
import { CanvasNodeData } from '@/types/canvas';

interface CanvasNodeProps {
  data: CanvasNodeData;
  isConnecting?: boolean;
  selected?: boolean;
}

export function CanvasNode({ data, isConnecting, selected }: CanvasNodeProps) {
  const borderColor = data.color || '#3b82f6';
  const backgroundColor = `${borderColor}20`;

  return (
    <div
      style={{
        borderColor,
        backgroundColor,
        borderWidth: '2px',
        borderRadius: '0.375rem',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '100px',
        minHeight: '40px',
        transition: 'all 150ms',
        opacity: isConnecting ? 0.5 : 1,
      }}
      className={selected ? 'ring-2 ring-white/60' : ''}
    >
      <Handle type="target" position={Position.Top} />
      <div className="text-center text-sm font-medium text-copy-primary break-words">
        {data.label || 'Node'}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
