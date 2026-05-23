'use client';

import { useCallback } from 'react';
import { Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CANVAS_TEMPLATES, type CanvasTemplate } from '@/components/editor/starter-templates';

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: CanvasTemplate) => void;
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  template.nodes.forEach(n => {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + (Number(n.style?.width) || 100));
    maxY = Math.max(maxY, n.position.y + (Number(n.style?.height) || 100));
  });

  const padding = 40;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = Math.max(10, maxX - minX);
  const height = Math.max(10, maxY - minY);
  const viewBox = `${minX} ${minY} ${width} ${height}`;

  return (
    <div className="w-full h-48 bg-base/50 border-b border-surface-border overflow-hidden flex items-center justify-center p-4">
      <svg viewBox={viewBox} className="w-full h-full max-h-full">
        {template.edges.map(e => {
          const source = template.nodes.find(n => n.id === e.source);
          const target = template.nodes.find(n => n.id === e.target);
          if (!source || !target) return null;
          
          const sx = source.position.x + (Number(source.style?.width) || 100) / 2;
          const sy = source.position.y + (Number(source.style?.height) || 100) / 2;
          const tx = target.position.x + (Number(target.style?.width) || 100) / 2;
          const ty = target.position.y + (Number(target.style?.height) || 100) / 2;

          return (
            <line 
              key={e.id}
              x1={sx} y1={sy} x2={tx} y2={ty}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="4"
            />
          );
        })}
        {template.nodes.map(n => {
          const w = Number(n.style?.width) || 100;
          const h = Number(n.style?.height) || 100;
          const isCircle = n.data.shape === 'circle';
          const isPill = n.data.shape === 'pill';
          const rx = isCircle ? w / 2 : (isPill ? h / 2 : 6);
          return (
            <rect
              key={n.id}
              x={n.position.x}
              y={n.position.y}
              width={w}
              height={h}
              rx={rx}
              fill={n.data.color as string}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}

export function StarterTemplatesModal({ isOpen, onClose, onImport }: StarterTemplatesModalProps) {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[1100px] w-full bg-surface text-copy-primary">
        <DialogHeader>
          <DialogTitle>Import Template</DialogTitle>
          <DialogDescription>
            Choose a starter template to pre-populate your canvas. Any existing nodes will be replaced — use <kbd className="font-sans px-1 rounded bg-muted text-xs">⌘Z</kbd> to undo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 overflow-y-auto max-h-[70vh] p-1">
          {CANVAS_TEMPLATES.map(template => (
            <div key={template.id} className="border border-surface-border bg-surface rounded-xl flex flex-col overflow-hidden">
              <TemplatePreview template={template} />
              <div className="p-5 flex flex-col flex-1 gap-2">
                <h3 className="font-semibold text-copy-primary text-base">{template.name}</h3>
                <p className="text-sm text-copy-muted mt-1 flex-1">{template.description}</p>
                <Button 
                  variant="outline"
                  className="w-full mt-4" 
                  onClick={() => {
                    onImport(template);
                    onClose();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
