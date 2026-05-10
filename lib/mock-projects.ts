export interface MockProject {
  id: string
  name: string
  slug: string
  owned: boolean
}

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: '1',
    name: 'System Architecture',
    slug: 'system-architecture',
    owned: true,
  },
  {
    id: '2',
    name: 'Mobile App Design',
    slug: 'mobile-app-design',
    owned: true,
  },
  {
    id: '3',
    name: 'API Gateway',
    slug: 'api-gateway',
    owned: false,
  },
]
