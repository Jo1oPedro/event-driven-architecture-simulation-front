import type { SimulationEventResponse, SimulationResponse, StartSimulationRequest } from '@/types/Simulation.ts'
import { apiRequest } from '@/api/client.ts'

export function startSimulation(data: StartSimulationRequest): Promise<SimulationResponse> {
  return apiRequest<SimulationResponse>('/api/simulations', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export function fetchSimulation(id: number): Promise<SimulationResponse>{
  return  apiRequest<SimulationResponse>(`/api/simulations/${id}`);
}

export function fetchSimulationEvents(id: number): Promise<SimulationEventResponse[]> {
  return apiRequest<SimulationEventResponse[]>(`/api/simulations/${id}/events`);
}
