import { Node, Edge } from '@xyflow/react';

export const NODE_COLORS = [
  { fill: '#1F1F1F', text: '#EDEDED', name: 'Neutral' },
  { fill: '#10233D', text: '#52A8FF', name: 'Blue' },
  { fill: '#2E1938', text: '#BF7AF0', name: 'Purple' },
  { fill: '#331B00', text: '#FF990A', name: 'Orange' },
  { fill: '#3C1618', text: '#FF6166', name: 'Red' },
  { fill: '#3A1726', text: '#F75F8F', name: 'Pink' },
  { fill: '#0F2E18', text: '#62C073', name: 'Green' },
  { fill: '#062822', text: '#0AC7B4', name: 'Teal' },
] as const;

export type NodeColorPair = (typeof NODE_COLORS)[number];

export function getNodeColorPair(fill?: string, text?: string): NodeColorPair {
  return (
    NODE_COLORS.find((color) => color.fill === fill && color.text === text) ??
    NODE_COLORS.find((color) => color.fill === fill) ??
    NODE_COLORS[0]
  );
}

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  textColor?: string;
  shape: 'rectangle' | 'circle' | 'diamond' | 'pill' | 'cylinder' | 'hexagon';
  onLabelChange?: (nodeId: string, label: string) => void;
  onColorChange?: (nodeId: string, color: NodeColorPair) => void;
}

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string;
  onLabelChange?: (edgeId: string, label: string) => void;
}

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>;
export type CanvasEdge = Edge<CanvasEdgeData, 'canvasEdge'>;
