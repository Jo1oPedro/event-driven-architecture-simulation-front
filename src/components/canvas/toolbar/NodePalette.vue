<script setup lang="ts">
import { NodeType} from '@/types/Topology.ts'

const nodeOptions = [
  {
    type: NodeType.Microservice,
    label: 'Microservice',
    color: 'border-blue-400 bg-blue-50 text-blue-700',
  },
  {
    type: NodeType.Queue,
    label: 'Queue',
    color: 'border-amber-400 bg-amber-50 text-amber-700',
  },
  {
    type: NodeType.Topic,
    label: 'Topic',
    color: 'border-green-400 bg-green-50 text-green-700',
  },
  {
    type: NodeType.Database,
    label: 'Database',
    color: 'border-purple-400 bg-purple-50 text-purple-700',
  },
]

function onDragStart(event: DragEvent, nodeType: NodeType) {
  if (!event.dataTransfer) return

  event.dataTransfer.setData('application/vueflow-node-type', nodeType)
  event.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <div class="flex flex-col gap-2 p-3 bg-base-200 rounded-lg shadow-md w-48">
    <span class="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">
      Drag to canvas
    </span>

    <div
      v-for="option in nodeOptions"
      :key="option.type"
      class="cursor-grab rounded-md border-2 px-3 py-2 text-sm font-medium text-center select-none"
      :class="option.color"
      draggable="true"
      @dragstart="onDragStart($event, option.type)"
    >
      {{ option.label }}
    </div>
  </div>
</template>

<style scoped>

</style>
