'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from '@xyflow/react';
import { CanvasEdge as CanvasEdgeType } from '@/types/canvas';

export function CanvasEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  selected,
  data,
}: EdgeProps<CanvasEdgeType>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const label = data?.label ?? '';
  const isActive = selected || isHovered || isEditing;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const stopCanvasInteraction = (
    event: React.MouseEvent | React.PointerEvent | React.KeyboardEvent
  ) => {
    event.stopPropagation();
  };

  const saveLabel = (nextLabel: string) => {
    data?.onLabelChange?.(id, nextLabel);
  };

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeLinecap="round"
        strokeWidth={28}
        className="react-flow__edge-interaction"
        onDoubleClick={(event) => {
          event.stopPropagation();
          setIsEditing(true);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={0}
        onDoubleClick={(event) => {
          event.stopPropagation();
          setIsEditing(true);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          stroke: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeOpacity: isActive ? 0.98 : 0.52,
          strokeWidth: selected ? 2.25 : 1.75,
          transition: 'stroke 150ms ease, stroke-opacity 150ms ease',
        }}
      />
      <EdgeLabelRenderer>
        {(isEditing || label || isActive) && (
          <div
            className="nodrag nopan absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            onDoubleClick={stopCanvasInteraction}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                aria-label="Edit edge label"
                className="rounded-xl border border-surface-border bg-surface px-2 py-1 text-center text-xs text-copy-primary shadow-lg shadow-base/40 outline-none placeholder:text-copy-muted focus:border-brand"
                placeholder="Label"
                size={Math.max(label.length, 5) + 1}
                value={label}
                onBlur={() => setIsEditing(false)}
                onChange={(event) => saveLabel(event.target.value)}
                onKeyDown={(event) => {
                  stopCanvasInteraction(event);

                  if (event.key === 'Enter' || event.key === 'Escape') {
                    setIsEditing(false);
                    event.currentTarget.blur();
                  }
                }}
                onMouseDown={stopCanvasInteraction}
                onPointerDown={stopCanvasInteraction}
              />
            ) : (
              <button
                type="button"
                aria-label={label ? `Edit label: ${label}` : 'Add label'}
                className={`rounded-xl border px-2 py-1 text-xs shadow-lg shadow-base/30 transition-colors ${
                  label
                    ? 'border-surface-border bg-surface text-copy-secondary'
                    : 'border-surface-border bg-surface/70 text-copy-muted'
                }`}
                onDoubleClick={(event) => {
                  stopCanvasInteraction(event);
                  setIsEditing(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    stopCanvasInteraction(event);
                    setIsEditing(true);
                  }
                }}
                onMouseDown={stopCanvasInteraction}
                onPointerDown={stopCanvasInteraction}
              >
                {label || 'Add label'}
              </button>
            )}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
