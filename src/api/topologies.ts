import { apiRequest } from '@/api/client.ts'
import type {
  TopologyResponse,
  TopologyListResponse,
  SaveTopologyRequest
} from '@/types/Topology.ts'

export function fetchTopologies(): Promise<TopologyListResponse[]> {
  return apiRequest<TopologyListResponse[]>('/api/topologies');
}

export function fetchTopology(id: number): Promise<TopologyResponse> {
  return apiRequest<TopologyResponse>(`/api/topologies/${id}`);
}

export function createTopology(data: SaveTopologyRequest): Promise<TopologyResponse> {
  return apiRequest<TopologyResponse>('/api/topologies', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateTopology(id: number, data: SaveTopologyRequest): Promise<TopologyResponse> {
  return apiRequest<TopologyResponse>(`/api/topologies/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function deleteTopology(id: number): Promise<null> {
  return apiRequest<null>(`/api/topologies/${id}`, {
    method: 'DELETE'
  })
}
