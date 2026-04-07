<script setup lang="ts">
import { markRaw, watch } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge } from '@vue-flow/core'
import MicroserviceNode from './nodes/MicroserviceNode.vue'
import QueueNode from './nodes/QueueNode.vue'
import TopicNode from './nodes/TopicNode.vue'
import DatabaseNode from './nodes/DatabaseNode.vue'
import NodePalette from './toolbar/NodePalette.vue'
import CanvasToolbar from './toolbar/CanvasToolbar.vue'
import PropertiesPanel from './PropertiesPanel.vue'
import { NodeType, type TopologyResponse } from '@/types/Topology.ts'
import { useTopologyStore } from '@/stores/topology.ts'
import { useSimulationStore} from '@/stores/simulation.ts'

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
  setNodes,
  setEdges,
  getNodes,
  getEdges,
  screenToFlowCoordinate,
} = useVueFlow('architecture-canvas')

const topologyStore = useTopologyStore();

async function onSave() {
  const response = await topologyStore.save(getNodes.value, getEdges.value)
  if (!response) return

  // Após salvar, sincroniza o canvas com os IDs do banco.
  // O Mercure envia eventos com IDs do banco, então precisam bater.
  syncCanvasWithResponse(response)
}

function syncCanvasWithResponse(response: TopologyResponse) {
  setNodes(
    response.nodes.map((node) => ({
      id: String(node.id),
      type: node.type,
      label: node.label,
      position: { x: node.positionX, y: node.positionY },
      data: { config: node.config },
    })),
  )

  setEdges(
    response.edges.map((edge) => ({
      id: String(edge.id),
      source: String(edge.sourceNodeId),
      target: String(edge.targetNodeId),
      data: {
        simulatedLatency: edge.simulatedLatency,
        failureRate: edge.failureRate,
      },
    })),
  )
}

// Carrega uma topologia salva no canvas
async function loadTopology(id: number) {
  const result = await topologyStore.load(id)
  if (!result) return

  setNodes(result.nodes)
  setEdges(result.edges)
}

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

const simulationStore = useSimulationStore();
async function onSimulate()  {
  if(!topologyStore.currentTopologyId) return;
  await simulationStore.start(topologyStore.currentTopologyId);
}

// Expõe para o componente pai poder carregar topologias
defineExpose({ loadTopology })

// Observa mudanças no animatingEdges e atualiza o estilo das edges no Vue Flow
watch(
  () => simulationStore.animatingEdges,
  (animating) => {
    for (const edge of getEdges.value) {
      const key = `${edge.source}-${edge.target}`
      if (key in animating) {
        const status = animating[key]
        const color = status === 'failed' ? '#ef4444' : status === 'sent' ? '#f59e0b' : '#22c55e'
        edge.style = {
          stroke: color,
          strokeWidth: 3,
        }
        edge.animated = true
      } else {
        edge.style = {}
        edge.animated = false
      }
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="flex h-full w-full">
    <div class="absolute top-4 left-4 z-10 bg-green-200">
      <NodePalette />
    </div>

    <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-red-200">
      <CanvasToolbar
        @save="onSave"
        @clear="onClear"
        @simulate="onSimulate"
      />
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

.vue-flow__edge.animated-edge path {
  stroke: #22c55e;
  stroke-width: 3;
  animation: edge-pulse 0.6s ease-in-out;
}

.vue-flow__edge.animated-edge.failed path {
  stroke: #ef4444;
}

@keyframes edge-pulse {
  0% { stroke-opacity: 0.3; stroke-width: 2; }
  50% { stroke-opacity: 1; stroke-width: 4; }
  100% { stroke-opacity: 0.3; stroke-width: 2; }
}
</style>
