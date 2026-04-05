<script setup lang="ts">
import { markRaw } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge } from '@vue-flow/core'
import MicroserviceNode from './nodes/MicroserviceNode.vue'
import QueueNode from './nodes/QueueNode.vue'
import TopicNode from './nodes/TopicNode.vue'
import DatabaseNode from './nodes/DatabaseNode.vue'
import NodePalette from './toolbar/NodePalette.vue'
import CanvasToolbar from './toolbar/CanvasToolbar.vue'
import PropertiesPanel from './PropertiesPanel.vue'
import { NodeType } from '@/types/Topology.ts'

const nodeTypes = {
  microservice: markRaw(MicroserviceNode),
  queue: markRaw(QueueNode),
  topic: markRaw(TopicNode),
  database: markRaw(DatabaseNode),
}

const defaultLabels: Record<NodeType, string> = {
  [NodeType.Microservice]: 'New Service',
  [NodeType.Queue]: 'New Queue',
  [NodeType.Topic]: 'New Topic',
  [NodeType.Database]: 'New Database',
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

let nodeIdCounter = 0

const {
  onConnect,
  addEdges,
  addNodes,
  removeNodes,
  removeEdges,
  getNodes,
  getEdges,
  screenToFlowCoordinate,
} = useVueFlow('architecture-canvas')

onConnect((params) => {
  addEdges([
    {
      ...params,
      id: `e-${params.source}-${params.target}`,
      data: { simulatedLatency: 100, failureRate: 0 },
    },
  ])
})

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function onDrop(event: DragEvent) {
  if (!event.dataTransfer) return

  const nodeType = event.dataTransfer.getData('application/vueflow-node-type') as NodeType
  if (!nodeType) return

  const position = screenToFlowCoordinate({
    x: event.clientX,
    y: event.clientY,
  })

  const id = `node-${Date.now()}-${++nodeIdCounter}`

  addNodes([
    {
      id,
      type: nodeType,
      label: defaultLabels[nodeType],
      position,
      data: {},
    },
  ])
}

function onClear() {
  removeNodes(getNodes.value.map((n) => n.id))
  removeEdges(getEdges.value.map((e) => e.id))
}

function onSave() {
  // Vai ser implementado na próxima fase com a API
  console.log('Nodes:', getNodes.value)
  console.log('Edges:', getEdges.value)
}
</script>

<template>
  <div class="flex h-full w-full">
    <div class="absolute top-4 left-4 z-10 bg-green-200">
      <NodePalette />
    </div>

    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-red-200">
      <CanvasToolbar @save="onSave" @clear="onClear" />
    </div>

    <div class="absolute top-4 right-4 z-10 bg-green-200">
      <PropertiesPanel />
    </div>

    <VueFlow
      id="architecture-canvas"
      :default-nodes="initialNodes"
      :default-edges="initialEdges"
      :node-types="nodeTypes"
      :default-edge-options="{ selectable: true, deletable: true }"
      fit-view-on-init
      @dragover="onDragOver"
      @drop="onDrop"
    />
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
