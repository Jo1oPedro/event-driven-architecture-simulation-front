<script setup lang="ts">
import { computed } from 'vue'
import { useVueFlow, type GraphNode, type GraphEdge } from '@vue-flow/core'

const {
  getSelectedNodes,
  getSelectedEdges,
  updateNode,
} =
  useVueFlow('architecture-canvas')

const selectedNode = computed<GraphNode | null>(() => {
  return getSelectedNodes.value.length === 1 ? getSelectedNodes.value[0] : null
})

const selectedEdge = computed<GraphEdge | null>(() => {
  return getSelectedEdges.value.length === 1 ? getSelectedEdges.value[0] : null
})

const hasSelection = computed(() => {
  return selectedNode.value !== null || selectedEdge.value !== null
})

function onNodeLabelChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (selectedNode.value) {
    updateNode(selectedNode.value.id, { label: target.value })
  }
}

function onEdgeLatencyChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (selectedEdge.value) {
    if (!selectedEdge.value.data) selectedEdge.value.data = {}
    selectedEdge.value.data.simulatedLatency = parseInt(target.value) || 0
  }
}

function onEdgeFailureRateChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (selectedEdge.value) {
    if (!selectedEdge.value.data) selectedEdge.value.data = {}
    selectedEdge.value.data.failureRate = parseFloat(target.value) || 0
  }
}
</script>

<template>
  <div v-if="hasSelection" class="w-64 p-4 bg-base-200 rounded-lg shadow-md">
    <!-- Propriedades do nó -->
    <template v-if="selectedNode">
      <h3 class="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-3">
        Node Properties
      </h3>

      <div class="flex flex-col gap-3">
        <div>
          <label class="label text-xs">Type</label>
          <input
            type="text"
            class="input input-sm input-bordered w-full"
            :value="selectedNode.type"
            disabled
          />
        </div>

        <div>
          <label class="label text-xs">Label</label>
          <input
            type="text"
            class="input input-sm input-bordered w-full"
            :value="selectedNode.label"
            @input="onNodeLabelChange"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label text-xs">X</label>
            <input
              type="number"
              class="input input-sm input-bordered w-full"
              :value="Math.round(selectedNode.position.x)"
              disabled
            />
          </div>
          <div>
            <label class="label text-xs">Y</label>
            <input
              type="number"
              class="input input-sm input-bordered w-full"
              :value="Math.round(selectedNode.position.y)"
              disabled
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Propriedades da edge -->
    <template v-if="selectedEdge">
      <h3 class="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-3">
        Edge Properties
      </h3>

      <div class="flex flex-col gap-3">
        <div>
          <label class="label text-xs">Source → Target</label>
          <input
            type="text"
            class="input input-sm input-bordered w-full"
            :value="`${selectedEdge.source} → ${selectedEdge.target}`"
            disabled
          />
        </div>

        <div>
          <label class="label text-xs">Simulated Latency (ms)</label>
          <input
            type="number"
            class="input input-sm input-bordered w-full"
            :value="selectedEdge.data?.simulatedLatency ?? 100"
            min="0"
            @input="onEdgeLatencyChange"
          />
        </div>

        <div>
          <label class="label text-xs">Failure Rate (0.0 - 1.0)</label>
          <input
            type="number"
            class="input input-sm input-bordered w-full"
            :value="selectedEdge.data?.failureRate ?? 0"
            min="0"
            max="1"
            step="0.01"
            @input="onEdgeFailureRateChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>
