export enum NodeType {
  Microservice = 'microservice',
  Queue = 'queue',
  Topic = 'topic',
  Database = 'database'
}

export interface TopologyNodeResponse {
  id: number,
  type: NodeType,
  label: string,
  positionX: number,
  positionY: number,
  config: Record<string, unknown>
}

export interface TopologyEdgeResponse {
  id: number,
  sourceNodeId: number,
  targetNodeId: number,
  simulatedLatency: number,
  failureRate: number
}

export interface TopologyResponse {
  id: number,
  name: string,
  description: string | null,
  createdAt: string,
  updatedAt: string | null,
  nodes: TopologyNodeResponse[],
  edges: TopologyEdgeResponse[]
}

export interface TopologyListResponse {
  id: number,
  name: string,
  description: string | null,
  nodeCount: number,
  edgeCount: number,
  createdAt: string
}

export interface SaveTopologyRequest {
  name: string,
  description?: string | null,
  nodes: {
    clientId: string,
    type: NodeType,
    label: string,
    positionX: number,
    positionY: number,
    config?: Record<string, unknown>
  }[]
  edges: {
    source: string,
    target: string,
    simulatedLatency?: number,
    failureRate?: number
  }[]
}
