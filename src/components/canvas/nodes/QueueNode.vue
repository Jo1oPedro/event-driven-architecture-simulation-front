<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { CustomData, CustomEvents } from './nodes'
const props = defineProps<NodeProps<CustomData, CustomEvents>>()
</script>

<template>
  <Handle type="target" :position="Position.Left" />

  <div
    class="px-4 py-3 rounded-lg border-2 shadow-md min-w-[140px] text-center"
    :class="props.selected ? 'border-amber-600 bg-amber-100' : 'border-amber-400 bg-amber-50'"
  >
    <div class="text-[10px] font-bold uppercase tracking-wider text-amber-400">
      Queue
    </div>
    <div class="text-sm font-semibold text-amber-700 mt-1">
      {{ props.label }}
    </div>
  </div>
</template>

<style scoped>

</style>
