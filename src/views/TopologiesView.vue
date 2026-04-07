<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTopologyStore } from '@/stores/topology'

const router = useRouter()
const topologyStore = useTopologyStore()

onMounted(() => {
  topologyStore.loadList()
})

function openEditor(id: number) {
  router.push({ name: 'editor-topology', params: { id } })
}

function createNew() {
  topologyStore.resetCurrent()
  router.push({ name: 'editor' })
}

async function onDelete(id: number) {
  if (!confirm('Delete this topology?')) return
  await topologyStore.remove(id)
}
</script>

<template>
  <div class="h-full bg-base-300 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-3xl font-bold">Topologies</h1>
        <button class="btn btn-primary" @click="createNew">
          + New Topology
        </button>
      </div>

      <div v-if="topologyStore.isLoading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <div v-else-if="topologyStore.topologyList.length === 0" class="text-center py-12">
        <p class="text-base-content/50 text-lg mb-4">No topologies yet</p>
        <button class="btn btn-primary" @click="createNew">Create your first topology</button>
      </div>

      <div v-else class="grid gap-4">
        <div
          v-for="topology in topologyStore.topologyList"
          :key="topology.id"
          class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          @click="openEditor(topology.id)"
        >
          <div class="card-body flex-row items-center justify-between">
            <div>
              <h2 class="card-title text-lg">{{ topology.name }}</h2>
              <p v-if="topology.description" class="text-sm text-base-content/60 mt-1">
                {{ topology.description }}
              </p>
              <div class="flex gap-3 mt-2 text-sm text-base-content/50">
                <span>{{ topology.nodeCount }} nodes</span>
                <span>{{ topology.edgeCount }} edges</span>
                <span>{{ new Date(topology.createdAt).toLocaleDateString() }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                class="btn btn-sm btn-ghost btn-error"
                @click.stop="onDelete(topology.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="topologyStore.error" class="alert alert-error mt-4">
        {{ topologyStore.error }}
      </div>
    </div>
  </div>
</template>
