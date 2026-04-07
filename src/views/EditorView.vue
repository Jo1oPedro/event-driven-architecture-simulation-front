<script setup lang="ts">
import ArchitectureCanvas from '@/components/canvas/ArchitectureCanvas.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const canvasRef = ref<InstanceType<typeof ArchitectureCanvas> | null>(null)

onMounted(() => {
  const topologyId = route.params.id
  if (topologyId && canvasRef.value) {
    canvasRef.value.loadTopology(Number(topologyId))
  }
})
</script>

<template>
  <ArchitectureCanvas ref="canvasRef" />
</template>
