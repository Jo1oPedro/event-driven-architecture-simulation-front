<script setup lang="ts">
import { useTopologyStore } from '@/stores/topology.ts'
import { useSimulationStore } from '@/stores/simulation.ts'

const topologyStore = useTopologyStore()
const simulationStore = useSimulationStore()

const emit = defineEmits<{
  save: []
  clear: []
  simulate: []
}>()
</script>

<template>
  <div class="flex items-center gap-2 p-3 bg-base-200 rounded-lg shadow-md">
    <input
      type="text"
      class="input input-sm input-bordered w-48"
      v-model="topologyStore.currentName"
      placeholder="Topology name"
    />
    <button class="btn btn-sm btn-primary" :disabled="topologyStore.isSaving" @click="emit('save')">
      {{ topologyStore.isSaving ? 'Saving...' : 'Save' }}
    </button>
    <button class="btn btn-sm btn-error btn-outline" @click="emit('clear')">
      Clear
    </button>

    <button
      class="btn btn-sm btn-accent"
      :disabled="
        !topologyStore.currentTopologyId || simulationStore.isStarting || simulationStore.isRunning
      "
      @click="emit('simulate')"
    >
      {{ simulationStore.isStarting ? 'Starting...' : simulationStore.isRunning ? 'Running...' : 'Simulate' }}
    </button>

    <span v-if="simulationStore.isRunning" class="badge badge-warning badge-sm">Running</span>
    <span v-if="simulationStore.isCompleted" class="badge badge-success badge-sm">Completed</span>

    <span v-if="topologyStore.error" class="text-error text-xs">
      {{ topologyStore.error }}
    </span>
  </div>
</template>

<style scoped></style>
