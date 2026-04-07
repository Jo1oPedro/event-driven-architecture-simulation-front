export enum SimulationStatus {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed'
}

export enum EventStatus {
  Sent = 'sent',
  Delivered = 'delivered',
  Failed = 'failed'
}

export interface SimulationResponse {
  id: number,
  status: SimulationResponse,
  topologyId: number,
  startedAt: string | null,
  completedAt: string | null,
  eventCount: number
}

export interface SimulationEventResponse {
  id: number,
  sourceNodeId: number,
  targetNodeId: number,
  status: EventStatus,
  latency: number,
  createdAt: string
}

export interface StartSimulationRequest {
  topologyId: number
}
