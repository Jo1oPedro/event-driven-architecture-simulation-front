import { defineStore } from 'pinia'
import type { SaveTopologyRequest, TopologyListResponse, TopologyResponse } from '@/types/Topology.ts'
import type { Edge, Node } from '@vue-flow/core'
import { createTopology, deleteTopology, fetchTopologies, fetchTopology, updateTopology } from '@/api/topologies.ts'
import { ref } from 'vue'

export const useTopologyStore = defineStore('topology', () => {
  // Estados
  const currentTopologyId = ref<number | null>(null);
  const currentName = ref('Untitled topology');
  const currentDescription = ref<string | null>(null);
  const topologyList = ref<TopologyListResponse[]>([]);
  const isSaving = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Conversores
  function convertApiNodesToVueFlow(response: TopologyResponse): Node[] {
    return response.nodes.map((node) => ({
      id: String(node.id),
      type: node.type,
      label: node.label,
      position: { x: node.positionX, y: node.positionY},
      data: { config: node.config },
    }));
  }

  function convertApiEdgesToVueFlow(response: TopologyResponse): Edge[] {
    return response.edges.map((edge) => ({
      id: String(edge.id),
      source: String(edge.sourceNodeId),
      target: String(edge.targetNodeId),
      data: {
        simulatedLatency: edge.simulatedLatency,
        failureRate: edge.failureRate
      }
    }));
  }

  function vueFlowToApiRequest(
    name: string,
    description: string | null,
    nodes: Node[],
    edges: Edge[],
  ): SaveTopologyRequest {
    return {
      name,
      description,
      nodes: nodes.map((node) => ({
        clientId: node.id,
        type: node.type as SaveTopologyRequest['nodes'][0]['type'],
        label: (node.label as string) ?? 'Unnamed',
        positionX: node.position.x,
        positionY: node.position.y,
        config: node.data?.config ?? [],
      })),
      edges: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        simulatedLatency: edge.data?.simulatedLatency ?? 100,
        failureRate: edge.data?.failureRate ?? 0
      })),
    }
  }

  // Actions

  // Carrega lista simplificada de topologias
  async function loadList() {
    isLoading.value = true;
    error.value = null;
    try {
      topologyList.value = await fetchTopologies()
    } catch (e: unknown) {
      error.value = (e as { message: string }).message ?? 'Failed to load topologies'
    } finally {
      isLoading.value = false
    }
  }

  // Carrega uma topologia e retorna os nós e arestas no formato do vue flow
  async function load(id: number): Promise<{nodes: Node[], edges: Edge[]} | null> {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetchTopology(id)
      currentTopologyId.value = response.id;
      currentName.value = response.name;
      currentDescription.value = response.description;

      return {
        nodes: convertApiNodesToVueFlow(response),
        edges: convertApiEdgesToVueFlow(response)
      }
    } catch (e: unknown) {
      error.value = (e as {message: string}).message ?? 'Failed to load topology';
      return null
    } finally {
      isLoading.value = false;
    }
  }

  // Salva a toplogia (cria nova ou atualiza existente)
  async function save(nodes: Node[], edges: Edge[]) {
    isSaving.value = true
    error.value = null
    try {
      const request = vueFlowToApiRequest(
        currentName.value,
        currentDescription.value,
        nodes,
        edges
      )

      let response: TopologyResponse

      if(currentTopologyId.value) {
        response = await updateTopology(currentTopologyId.value, request)
      } else {
        response = await createTopology(request)
      }

      currentTopologyId.value = response.id;
      currentName.value = response.name;

      return response;
    } catch (e: unknown) {
      error.value = (e as { message: string }).message ?? 'Failed to save topology'
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  // Remove uma topology
  async function remove(id: number) {
    error.value = null;
    try {
      await deleteTopology(id);
      topologyList.value = topologyList.value.filter((t) => t.id !== id);

      if(currentTopologyId.value === id) {
        currentTopologyId.value = null;
        currentName.value = 'Undefined Topology';
        currentDescription.value = null;
      }
    } catch (e: unknown) {
      error.value = (e as { message: string }).message ?? 'Failed to delete topology';
    }
  }

  // Reseta o estado da store para uma topoogy nova
  function resetCurrent() {
    currentTopologyId.value = null;
    currentName.value = 'Untitled Topology';
    currentDescription.value = null;
    error.value = null;
  }

  return {
    // Estados
    currentTopologyId,
    currentName,
    currentDescription,
    topologyList,
    isSaving,
    isLoading,
    error,

    // Actions
    loadList,
    load,
    save,
    remove,
    resetCurrent
  }
});
