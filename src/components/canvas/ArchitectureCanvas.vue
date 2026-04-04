<script setup lang="ts">
import { ref } from 'vue'
import { markRaw } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import MicroserviceNode from '@/components/canvas/nodes/MicroserviceNode.vue'
import QueueNode from '@/components/canvas/nodes/QueueNode.vue'
import TopicNode from '@/components/canvas/nodes/TopicNode.vue'
import DatabaseNode from '@/components/canvas/nodes/DatabaseNode.vue'

const nodeTypes = {
  microservice: markRaw(MicroserviceNode),
  queue: markRaw(QueueNode),
  topic: markRaw(TopicNode),
  database: markRaw(DatabaseNode),
}

const initialNodes = ref<Node[]>([
  {
    id: 'node-1',
    type: 'microservice',
    label: 'API Gateway',
    position: { x: 50, y: 200 },
    data: {},
  },
  {
    id: 'node-2',
    type: 'queue',
    label: 'Order Queue',
    position: { x: 350, y: 200 },
    data: {},
  },
  {
    id: 'node-3',
    type: 'microservice',
    label: 'Order Service',
    position: { x: 650, y: 200 },
    data: {},
  },
  {
    id: 'node-4',
    type: 'topic',
    label: 'order.created',
    position: { x: 950, y: 200 },
    data: {},
  },
  {
    id: 'node-5',
    type: 'microservice',
    label: 'Payment Service',
    position: { x: 1250, y: 100 },
    data: {},
  },
  {
    id: 'node-6',
    type: 'microservice',
    label: 'Notification Service',
    position: { x: 1250, y: 300 },
    data: {},
  },
  {
    id: 'node-7',
    type: 'database',
    label: 'PostgreSQL Orders',
    position: { x: 650, y: 400 },
    data: {},
  },
]);

const initialEdges: Edge[] = [
  { id: 'e1', source: 'node-1', target: 'node-2' },
  { id: 'e2', source: 'node-2', target: 'node-3' },
  { id: 'e3', source: 'node-3', target: 'node-4' },
  { id: 'e4', source: 'node-3', target: 'node-7' },
  { id: 'e5', source: 'node-4', target: 'node-5' },
  { id: 'e6', source: 'node-4', target: 'node-6' },
]

const { onConnect, addEdges } = useVueFlow('architecture-canvas')

onConnect((params) => {
  addEdges([
    {
      ...params,
      id: `e-${params.source}-${params.target}`,
    },
  ])
})

function removeEdge(id) {
  edges.value = edges.value.filter((edge) => edge.id !== id)
}
</script>

<template>
    <VueFlow
      id="architecture-canvas"
      :nodes="initialNodes"
      :edges="initialEdges"
      :nodeTypes="nodeTypes"
      fit-view-on-init
    />
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>
