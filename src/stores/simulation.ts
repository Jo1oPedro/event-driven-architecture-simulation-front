import {
  type SimulationEventResponse,
  type SimulationResponse,
  SimulationStatus,
} from '@/types/Simulation.ts'
import { useMercure } from '@/composables/useMercure.ts'
import { computed, ref } from 'vue'
import { fetchSimulationEvents, startSimulation } from '@/api/simulation.ts'
import { defineStore } from 'pinia'

export const useSimulationStore = defineStore('simulation', () => {
  const simulation = ref<SimulationResponse | null>(null)
  const events = ref<SimulationEventResponse[]>([])
  const isStarting = ref(false)
  const error = ref<string | null>(null)

  // Edges que estão animando — Map<"sourceNodeId-targetNodeId", status>
  const animatingEdges = ref<Record<string, string>>({})

  // Conexões Mercure
  let eventsMercure: ReturnType<typeof useMercure<SimulationEventResponse>> | null = null
  let statusMercure: ReturnType<typeof useMercure<SimulationResponse>> | null = null

  const isRunning = computed(() => simulation.value?.status === SimulationStatus.Running)
  const isCompleted = computed(() => simulation.value?.status === SimulationStatus.Completed)

  async function start(topologyId: number) {
    isStarting.value = true
    error.value = null

    try {
      // 1. Inicia a simulação no backend — recebe o ID
      simulation.value = await startSimulation({ topologyId })
      const simId = simulation.value.id

      // 2. Conecta no Mercure para receber eventos futuros
      connectMercure(simId)

      // 3. Busca eventos que já foram processados (entre o POST e o connect)
      const existingEvents = await fetchSimulationEvents(simId)
      for (const event of existingEvents) {
        if (!events.value.find((e) => e.id === event.id)) {
          events.value.push(event)
          // Anima edges de eventos que já foram processados
          const edgeKey = `${event.sourceNodeId}-${event.targetNodeId}`
          animatingEdges.value[edgeKey] = event.status
          setTimeout(() => {
            delete animatingEdges.value[edgeKey]
          }, 1500)
        }
      }

      // 4. Se já completou antes do Mercure conectar, atualiza o status
      if (existingEvents.length > 0 && simulation.value.status === SimulationStatus.Running) {
        // Checa se todos os eventos já foram processados
        checkIfCompleted(simId)
      }
    } catch (e: unknown) {
      error.value = (e as { message: string }).message ?? 'Failed to start simulation'
      disconnect()
      return null
    } finally {
      isStarting.value = false
    }
  }

  // Busca o status atualizado caso a simulação tenha completado antes do Mercure conectar
  async function checkIfCompleted(simulationId: number) {
    try {
      const { fetchSimulation } = await import('@/api/simulation.ts')
      const updated = await fetchSimulation(simulationId)
      if (simulation.value) {
        simulation.value.status = updated.status
        simulation.value.completedAt = updated.completedAt
        simulation.value.eventCount = updated.eventCount
      }
      if (
        updated.status === SimulationStatus.Completed ||
        updated.status === SimulationStatus.Failed
      ) {
        disconnect()
      }
    } catch {
      // ignora
    }
  }

  function connectMercure(simulationId: number) {
    // Escuta eventos individuais (cada mensagem que flui pelo grafo)
    eventsMercure = useMercure<SimulationEventResponse>(
      `simulation/${simulationId}/events`,
      (event) => {
        const edgeKey = `${event.sourceNodeId}-${event.targetNodeId}`

        if (event.status === 'sent') {
          // Mensagem começou a viajar — anima a edge pela duração da latência
          animatingEdges.value[edgeKey] = 'sent'
        } else {
          // delivered ou failed — atualiza o status e remove após 1.5s
          animatingEdges.value[edgeKey] = event.status
          events.value.push(event)

          setTimeout(() => {
            delete animatingEdges.value[edgeKey]
          }, 1500)
        }
      },
    )
    eventsMercure.connect()

    // Escuta mudanças de status (running → completed/failed)
    statusMercure = useMercure<SimulationResponse>(
      `simulation/${simulationId}/status`,
      (update) => {
        if (simulation.value) {
          simulation.value.status = update.status
          simulation.value.completedAt = update.completedAt

          if (
            update.status === SimulationStatus.Completed ||
            update.status === SimulationStatus.Failed
          ) {
            disconnect()
          }
        }
      },
    )
    statusMercure.connect()
  }

  // animateEdge removido — a lógica agora está no callback do Mercure
  // "sent" anima indefinidamente, "delivered/failed" remove após 1.5s

  function disconnect() {
    eventsMercure?.disconnect()
    statusMercure?.disconnect()
    eventsMercure = null
    statusMercure = null
  }

  function reset() {
    disconnect()
    simulation.value = null
    events.value = []
    animatingEdges.value = {}
    error.value = null
  }

  return {
    simulation,
    events,
    animatingEdges,
    isStarting,
    isRunning,
    isCompleted,
    error,
    start,
    disconnect,
    reset,
  }
})
