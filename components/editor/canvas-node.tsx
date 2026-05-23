'use client';

import { useEffect, useRef, useState } from 'react';
import { Handle, NodeResizer, Position } from '@xyflow/react';
import {
  CanvasNodeData,
  getNodeColorPair,
  NODE_COLORS,
  NodeColorPair,
} from '@/types/canvas';
import { NodeShape } from '@/components/editor/node-shape';

interface CanvasNodeProps {
  id: string;
  data: CanvasNodeData;
  isConnecting?: boolean;
  selected?: boolean;
}

const MIN_NODE_WIDTH = 96;
const MIN_NODE_HEIGHT = 56;
const HANDLE_CLASS =
  '!h-2 !w-2 !border !border-base !bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100';

export function CanvasNode({ id, data, isConnecting, selected }: CanvasNodeProps) {
  const activeColor = getNodeColorPair(data.color, data.textColor);
  const fill = activeColor.fill;
  const textColor = data.textColor || activeColor.text;
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextareaToContent = () => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
      resizeTextareaToContent();
    }
  }, [data.label, isEditing]);

  const handleLabelChange = (label: string) => {
    data.onLabelChange?.(id, label);
  };

  const handleColorChange = (color: NodeColorPair) => {
    data.onColorChange?.(id, color);
  };

  const stopCanvasInteraction = (
    event: React.MouseEvent | React.PointerEvent | React.KeyboardEvent
  ) => {
    event.stopPropagation();
  };

  return (
    <div
      className="group relative flex h-full w-full items-center justify-center px-4 py-3 transition-opacity duration-150"
      style={{
        opacity: isConnecting ? 0.5 : 1,
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        handleClassName="!h-2 !w-2 !rounded-full !border !border-surface-border !bg-surface"
        lineClassName="!border-brand/70"
      />
      {selected && (
        <div
          className="nodrag nopan absolute bottom-full left-1/2 z-30 mb-3 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-surface-border bg-surface/95 p-1.5 shadow-2xl shadow-base/50 backdrop-blur"
          onDoubleClick={stopCanvasInteraction}
          onMouseDown={stopCanvasInteraction}
          onPointerDown={stopCanvasInteraction}
        >
          {NODE_COLORS.map((color) => {
            const isActive = activeColor.fill === color.fill && activeColor.text === color.text;

            return (
              <button
                key={color.name}
                type="button"
                aria-label={`Use ${color.name} node color`}
                aria-pressed={isActive}
                className="h-5 w-5 rounded-full border transition-[box-shadow,transform,border-color] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                style={{
                  backgroundColor: color.fill,
                  borderColor: isActive ? color.text : 'var(--border-subtle)',
                  boxShadow: isActive
                    ? `0 0 0 2px ${color.text}`
                    : `0 0 0 0 ${color.text}`,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleColorChange(color);
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.boxShadow = isActive
                    ? `0 0 0 2px ${color.text}`
                    : `0 0 0 1px ${color.text}, 0 0 8px -2px ${color.text}`;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.boxShadow = isActive
                    ? `0 0 0 2px ${color.text}`
                    : `0 0 0 0 ${color.text}`;
                }}
                onMouseDown={stopCanvasInteraction}
                onPointerDown={stopCanvasInteraction}
              />
            );
          })}
        </div>
      )}
      <NodeShape shape={data.shape} fill={fill} selected={selected} selectedStroke={textColor} />
      <Handle
        id="top-target"
        className={HANDLE_CLASS}
        type="target"
        position={Position.Top}
      />
      <Handle
        id="right-target"
        className={HANDLE_CLASS}
        type="target"
        position={Position.Right}
      />
      <Handle
        id="bottom-target"
        className={HANDLE_CLASS}
        type="target"
        position={Position.Bottom}
      />
      <Handle
        id="left-target"
        className={HANDLE_CLASS}
        type="target"
        position={Position.Left}
      />
      {isEditing ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 py-3">
          <textarea
            ref={textareaRef}
            aria-label="Edit node label"
            className="nodrag nopan max-h-full w-full resize-none overflow-hidden border-none bg-transparent p-0 text-center text-sm font-medium leading-5 text-copy-primary outline-none placeholder:text-copy-muted"
            style={{ color: textColor }}
            placeholder="Node"
            rows={1}
            value={data.label}
            onBlur={() => setIsEditing(false)}
            onChange={(event) => {
              handleLabelChange(event.target.value);
              resizeTextareaToContent();
            }}
            onDoubleClick={stopCanvasInteraction}
            onKeyDown={(event) => {
              stopCanvasInteraction(event);
              if (event.key === 'Escape') {
                setIsEditing(false);
                textareaRef.current?.blur();
              }
            }}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={stopCanvasInteraction}
          />
        </div>
      ) : (
        <button
          type="button"
          className="nodrag nopan relative z-10 flex h-full max-w-full items-center justify-center border-none bg-transparent p-0 text-center text-sm font-medium text-copy-primary outline-none"
          style={{ color: textColor }}
          onDoubleClick={(event) => {
            stopCanvasInteraction(event);
            setIsEditing(true);
          }}
          onMouseDown={stopCanvasInteraction}
          onPointerDown={stopCanvasInteraction}
        >
          <span className={data.label ? 'break-words' : 'opacity-70'}>
            {data.label || 'Node'}
          </span>
        </button>
      )}
      <Handle
        id="top-source"
        className={HANDLE_CLASS}
        type="source"
        position={Position.Top}
      />
      <Handle
        id="right-source"
        className={HANDLE_CLASS}
        type="source"
        position={Position.Right}
      />
      <Handle
        id="bottom-source"
        className={HANDLE_CLASS}
        type="source"
        position={Position.Bottom}
      />
      <Handle
        id="left-source"
        className={HANDLE_CLASS}
        type="source"
        position={Position.Left}
      />
    </div>
  );
}
