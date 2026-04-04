<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { CustomData, CustomEvents } from './nodes'
const props = defineProps<NodeProps<CustomData, CustomEvents>>()
</script>

<template>
  <Handle type="target" :position="Position.Left" />

  <div
    style="
      padding: 12px 16px;
      border-radius: 8px;
      border: 2px solid #3b82f6;
      background: #eff6ff;
      min-width: 140px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    "
  >
    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #60a5fa">
      Microservice
    </div>
    <div style="font-size: 14px; font-weight: 600; color: #1d4ed8; margin-top: 4px">
      {{ props.label }}
    </div>
  </div>

  <Handle type="source" :position="Position.Right" />
</template>

<style scoped></style>
