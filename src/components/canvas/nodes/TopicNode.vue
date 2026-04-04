<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { CustomData, CustomEvents } from './nodes'
const props = defineProps<NodeProps<CustomData, CustomEvents>>()
</script>

<template>
  <Handle type="target" :position="Position.Left" />

  <div
    class="px-4 py-3 rounded-lg border-2 shadow-md min-w-[140px] text-center"
    :class="props.selected ? 'border-green-600 bg-green-100' : 'border-green-400 bg-green-50'"
  >
    <div class="text-[10px] font-bold uppercase tracking-wider text-green-400">
      Topic
    </div>
    <div class="text-sm font-semibold text-green-700 mt-1">
      {{ props.label }}
    </div>
  </div>

  <Handle type="source" :position="Position.Right" />
</template>
