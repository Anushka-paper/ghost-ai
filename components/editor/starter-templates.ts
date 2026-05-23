import { CanvasNode, CanvasEdge, getNodeColorPair } from '@/types/canvas';

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

const createNode = (
  id: string,
  shape: CanvasNode['data']['shape'],
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  colorPair = getNodeColorPair()
): CanvasNode => ({
  id,
  type: 'canvasNode',
  position: { x, y },
  data: {
    shape,
    label,
    color: colorPair.fill,
    textColor: colorPair.text,
  },
  style: { width, height },
});

const createEdge = (
  source: string,
  target: string,
  label = ''
): CanvasEdge => ({
  id: `e-${source}-${target}`,
  type: 'canvasEdge',
  source,
  target,
  data: { label },
});

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: 'microservices',
    name: 'Microservices Architecture',
    description: 'A standard API gateway routing to multiple backend services with their own databases.',
    nodes: [
      createNode('client', 'rectangle', 'Client', 50, 150, 120, 60, getNodeColorPair('#10233D')),
      createNode('gateway', 'hexagon', 'API Gateway', 250, 150, 140, 80, getNodeColorPair('#2E1938')),
      createNode('auth', 'pill', 'Auth Service', 450, 50, 120, 60, getNodeColorPair('#3A1726')),
      createNode('users', 'rectangle', 'User Service', 450, 150, 120, 60, getNodeColorPair('#0F2E18')),
      createNode('orders', 'rectangle', 'Order Service', 450, 250, 120, 60, getNodeColorPair('#331B00')),
      createNode('db-users', 'cylinder', 'User DB', 650, 150, 100, 80, getNodeColorPair('#1F1F1F')),
      createNode('db-orders', 'cylinder', 'Order DB', 650, 250, 100, 80, getNodeColorPair('#1F1F1F')),
    ],
    edges: [
      createEdge('client', 'gateway', 'HTTPS'),
      createEdge('gateway', 'auth', 'Verify'),
      createEdge('gateway', 'users', 'Route'),
      createEdge('gateway', 'orders', 'Route'),
      createEdge('users', 'db-users'),
      createEdge('orders', 'db-orders'),
    ],
  },
  {
    id: 'cicd',
    name: 'CI/CD Pipeline',
    description: 'A typical continuous integration and deployment pipeline.',
    nodes: [
      createNode('commit', 'circle', 'Commit', 50, 150, 80, 80, getNodeColorPair('#10233D')),
      createNode('build', 'rectangle', 'Build', 200, 150, 120, 60, getNodeColorPair('#0F2E18')),
      createNode('test', 'diamond', 'Test', 380, 150, 100, 100, getNodeColorPair('#331B00')),
      createNode('deploy-staging', 'rectangle', 'Staging', 550, 50, 120, 60, getNodeColorPair('#2E1938')),
      createNode('deploy-prod', 'rectangle', 'Production', 550, 250, 120, 60, getNodeColorPair('#3A1726')),
    ],
    edges: [
      createEdge('commit', 'build', 'Push'),
      createEdge('build', 'test', 'Artifacts'),
      createEdge('test', 'deploy-staging', 'Pass'),
      createEdge('deploy-staging', 'deploy-prod', 'Approve'),
    ],
  },
  {
    id: 'event-driven',
    name: 'Event-Driven System',
    description: 'An event broker routing messages to various consumer services.',
    nodes: [
      createNode('producer', 'rectangle', 'Producer', 50, 150, 120, 60, getNodeColorPair('#10233D')),
      createNode('broker', 'pill', 'Event Broker', 250, 150, 140, 80, getNodeColorPair('#3C1618')),
      createNode('consumer-A', 'rectangle', 'Consumer A', 480, 50, 120, 60, getNodeColorPair('#062822')),
      createNode('consumer-B', 'rectangle', 'Consumer B', 480, 150, 120, 60, getNodeColorPair('#062822')),
      createNode('consumer-C', 'rectangle', 'Consumer C', 480, 250, 120, 60, getNodeColorPair('#062822')),
    ],
    edges: [
      createEdge('producer', 'broker', 'Publish'),
      createEdge('broker', 'consumer-A', 'Subscribe'),
      createEdge('broker', 'consumer-B', 'Subscribe'),
      createEdge('broker', 'consumer-C', 'Subscribe'),
    ],
  }
];
