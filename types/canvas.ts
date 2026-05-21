import { Node, Edge } from '@xyflow/react';

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  shape: 'rectangle' | 'circle' | 'diamond' | 'pill' | 'cylinder' | 'hexagon';
}

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>;
export type CanvasEdge = Edge;
