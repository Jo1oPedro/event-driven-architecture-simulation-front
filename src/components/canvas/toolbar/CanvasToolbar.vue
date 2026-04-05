<script setup lang="ts">

import { useTopologyStore } from '@/stores/topology.ts'

const topologyStore = useTopologyStore();

const emit = defineEmits<{
  save: [],
  clear: []
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
    <button class="btn btn-sm btn-accent" disabled>
      Simulate
    </button>
    <span v-if="topologyStore.error" class="text-error text-xs">
      {{ topologyStore.error }}
    </span>
  </div>
</template>

<style scoped>

</style>
