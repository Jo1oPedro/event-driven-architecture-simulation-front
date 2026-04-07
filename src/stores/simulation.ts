import { type SimulationEventResponse, type SimulationResponse, SimulationStatus } from '@/types/Simulation.ts'
import { useMercure } from '@/composables/useMercure.ts'
import { computed, ref, watch } from 'vue'
import { fetchSimulation, startSimulation } from '@/api/simulation.ts'
import { defineStore } from 'pinia'

export const useSimulationStore = defineStore('simulation', () => {
  const simulation = ref<SimulationResponse | null>(null);
  const events = ref<SimulationEventResponse[]>([]);
  const isStarting = ref(false);
  const error = ref<string | null>(null);

  // Edges que estão animando("sourceNodeId-targetNodeId")
  const animatingEdges = ref<Set<string>>(new Set());

  // Conexões com mercure
  let eventsMercure: ReturnType<typeof useMercure<SimulationEventResponse>> | null = null;
  let statusMercure: ReturnType<typeof useMercure<SimulationResponse>> | null = null;

  const isRunning = computed(() => simulation.value?.status === SimulationStatus.Running);
  const isCompleted = computed(() => simulation.value?.status === SimulationStatus.Completed);

  async function start(topologyId: number) {
    isStarting.value = true;
    error.value = null;

    try {
      simulation.value = await startSimulation({ topologyId });
      listenToEvents(simulation.value.id);
      pollStatus(simulation.value.id); // fallback
    } catch (e: unknown) {
      error.value = (e as { message: string }).message ?? 'Failed to start simulation';
      return null;
    } finally {
      isStarting.value = false;
    }
  }

  let pollInterval: ReturnType<typeof setInterval> | null = null;

  function pollStatus(simulationId: number) {
    pollInterval = setInterval(async () => {
      try {
        const updated = await fetchSimulation(simulationId);
        if(simulation.value) {
          simulation.value.status = updated.status;
          simulation.value.completedAt = updated.completedAt;
          simulation.value.eventCount = updated.eventCount;
        }

        if(
          updated.status === SimulationStatus.Completed ||
          updated.status === SimulationStatus.Failed
        ) {
          stopPolling();
          disconnect();
        }
      } catch {

      }
    }, 1000);
  }

  function stopPolling() {
    if(pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function listenToEvents(simulationId: number) {
    eventsMercure = useMercure<SimulationEventResponse>(
      `simulation/${simulationId}/events`
    )
    eventsMercure?.connect();

    watch(eventsMercure.data, (newEvents) => {
      for (const event of newEvents) {
        if(!events.value.find((e) => e.id === event.id)) {
          events.value.push(event);
          animateEdge(event)
        }
      }
    }, { deep: true });

    statusMercure = useMercure<SimulationResponse>(
      `simulation/${simulationId}/status`
    );
    statusMercure?.connect();

    watch(statusMercure.data, (updates) => {
      const latest = updates[updates.length - 1];
      if(latest && simulation.value) {
        simulation.value.status = latest.status;
        simulation.value.completedAt = latest.completedAt;

        if(
          latest.status === SimulationStatus.Completed ||
          latest.status === SimulationStatus.Failed
        ) {
          disconnect();
        }
      }
    }, { deep: true });
  }

  function animateEdge(event: SimulationEventResponse) {
    const edgeKey = `${event.sourceNodeId}-${event.targetNodeId}`;
    animatingEdges.value.add(edgeKey);

    setTimeout(() => {
      animatingEdges.value.delete(edgeKey);
    }, 1000);
  }

  function disconnect() {
    eventsMercure?.disconnect();
    statusMercure?.disconnect();
    eventsMercure = null;
    statusMercure = null;
    stopPolling();
  }

  function reset() {
    disconnect();
    simulation.value = null;
    events.value = [];
    animatingEdges.value.clear();
    error.value = null;
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
    reset
  }
});
