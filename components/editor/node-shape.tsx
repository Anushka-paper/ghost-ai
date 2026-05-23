'use client';

import { CanvasNodeData } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface NodeShapeProps {
  shape: CanvasNodeData['shape'];
  fill: string;
  selected?: boolean;
  selectedStroke?: string;
  preview?: boolean;
  className?: string;
}

function getStrokeColor(selected?: boolean, selectedStroke?: string) {
  return selected ? selectedStroke ?? 'var(--accent-primary)' : 'var(--border-subtle)';
}

export function NodeShape({
  shape,
  fill,
  selected,
  selectedStroke,
  preview,
  className,
}: NodeShapeProps) {
  const strokeColor = getStrokeColor(selected, selectedStroke);
  const strokeWidth = selected ? 2.5 : 1.5;
  const opacity = preview ? 0.72 : 1;

  if (shape === 'rectangle' || shape === 'pill' || shape === 'circle') {
    return (
      <div
        className={cn(
          'absolute inset-0 border transition-colors duration-150',
          shape === 'rectangle' && 'rounded-xl',
          shape === 'pill' && 'rounded-full',
          shape === 'circle' && 'rounded-full',
          className
        )}
        style={{
          backgroundColor: fill,
          borderColor: strokeColor,
          borderWidth: strokeWidth,
          opacity,
        }}
      />
    );
  }

  if (shape === 'diamond') {
    return (
      <svg
        className={cn('absolute inset-0 h-full w-full overflow-visible', className)}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden="true"
        style={{ opacity }}
      >
        <polygon
          points="50 2, 98 50, 50 98, 2 50"
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  if (shape === 'hexagon') {
    return (
      <svg
        className={cn('absolute inset-0 h-full w-full overflow-visible', className)}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden="true"
        style={{ opacity }}
      >
        <polygon
          points="25 4, 75 4, 98 50, 75 96, 25 96, 2 50"
          fill={fill}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  return (
    <svg
      className={cn('absolute inset-0 h-full w-full overflow-visible', className)}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ opacity }}
    >
      <path
        d="M8 14 C8 7 92 7 92 14 L92 86 C92 93 8 93 8 86 Z"
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx="50"
        cy="14"
        rx="42"
        ry="10"
        fill={fill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M8 86 C8 93 92 93 92 86"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
