# CLAUDE.md

## Project Overview

Vue 3 + TypeScript frontend para o Event-Driven Architecture Visualizer & Simulator. Usa Vue Flow para modelagem visual de arquiteturas orientadas a eventos, com simulação em tempo real via Mercure.

## Tech Stack

- **Framework:** Vue 3 (Composition API + `<script setup>`)
- **Language:** TypeScript 6.0
- **Build:** Vite 8
- **State:** Pinia
- **Routing:** Vue Router 5 (history mode)
- **Styling:** Tailwind CSS 4 + DaisyUI 5
- **Graph/Flow:** @vue-flow/core ^1.48.2
- **Linting:** ESLint + Oxlint + Prettier (sem semicolons, single quotes, 100 chars)

## Project Structure

```
src/
  main.ts              # Entry point
  App.vue              # Root component (router outlet)
  assets/              # CSS, imagens
  components/          # Componentes reutilizáveis
  views/               # Páginas (rotas)
  router/index.ts      # Configuração de rotas
  stores/              # Pinia stores
```

## Common Commands

```bash
npm run dev          # Dev server (Vite)
npm run build        # Type-check + build produção
npm run preview      # Preview da build
npm run lint         # Oxlint + ESLint
npm run format       # Prettier
npm run type-check   # vue-tsc
```

## Code Standards

### Componentes

- Usar `<script setup lang="ts">` sempre
- Props com `defineProps<T>()` tipadas via interface
- Emits com `defineEmits<T>()`
- Composables em `src/composables/` para lógica reutilizável
- Componentes pequenos e focados — extrair quando ultrapassar ~150 linhas

### Stores (Pinia)

- Composition API style (`defineStore` com setup function)
- Um store por domínio: `useTopologyStore`, `useSimulationStore`
- Actions para operações assíncronas (API calls)
- Getters computados para dados derivados

### TypeScript

- Tipagem estrita — evitar `any`
- Interfaces em `src/types/` para modelos compartilhados
- `noUncheckedIndexedAccess: true` está habilitado

### Estilo

- Tailwind utility classes no template
- DaisyUI para componentes UI (botões, modais, cards, badges)
- Sem CSS custom exceto quando necessário para animações

## Backend Connection

- API Symfony em `https://localhost` (CORS configurado)
- Mercure hub em `https://localhost/.well-known/mercure`

---

## Event-Driven Architecture Visualizer & Simulator

### Visão Geral

O frontend é o canvas principal do projeto. O usuário modela topologias arrastando nós e conectando edges num grafo interativo (Vue Flow). Depois clica "Simulate" e vê mensagens fluindo em tempo real pelas conexões.

### Dependências Necessárias

Nenhuma dependência adicional obrigatória. Opcionais:

```bash
# Animações mais sofisticadas (opcional)
npm install @vueuse/core    # composables úteis (useEventSource, useIntervalFn, etc.)
```

O EventSource é nativo do browser — não precisa de lib para Mercure.

### Arquitetura Frontend

#### Estrutura de Diretórios (a criar)

```
src/
  types/
    topology.ts          # Node, Edge, Topology, NodeType (enum)
    simulation.ts        # Simulation, SimulationEvent, SimulationStatus (enum)
    metrics.ts           # ThroughputMetric, LatencyMetric
  stores/
    topology.ts          # useTopologyStore — CRUD topologias, nós, edges
    simulation.ts        # useSimulationStore — controle de simulação, eventos real-time
  composables/
    useMercure.ts        # Wrapper de EventSource para tópicos Mercure
    useSimulationAnimation.ts  # Lógica de animação de pulsos nas edges
  components/
    canvas/
      ArchitectureCanvas.vue   # Wrapper do VueFlow com toolbar
      nodes/
        MicroserviceNode.vue   # Nó customizado: microserviço
        QueueNode.vue          # Nó customizado: fila/queue
        TopicNode.vue          # Nó customizado: tópico pub/sub
        DatabaseNode.vue       # Nó customizado: banco de dados
      edges/
        MessageEdge.vue        # Edge customizada com animação de pulso
      toolbar/
        CanvasToolbar.vue      # Toolbar: add nodes, save, load, simulate
        NodePalette.vue        # Paleta de tipos de nós (drag to add)
    simulation/
      SimulationPanel.vue      # Painel lateral: controles de simulação
      SimulationMetrics.vue    # Dashboard de métricas em tempo real
      EventLog.vue             # Log de eventos da simulação
    topology/
      TopologyList.vue         # Lista de topologias salvas
      TopologySettings.vue     # Config da topologia (nome, desc)
  views/
    EditorView.vue             # Página principal: canvas + painéis
    TopologiesView.vue         # Lista de topologias salvas
  api/
    client.ts                  # Fetch wrapper (base URL, headers, error handling)
    topologies.ts              # API calls: CRUD topologias
    simulations.ts             # API calls: iniciar/parar/status simulações
```

#### Nós Customizados (Vue Flow)

Cada tipo de nó tem visual e comportamento distintos:

| Tipo | Ícone/Visual | Cor | Configurações |
|------|-------------|-----|---------------|
| Microservice | Container/box | Azul | Nome, processing time |
| Queue | Fila horizontal | Laranja | Max size, FIFO/LIFO |
| Topic | Broadcast/fan-out | Verde | Nome do tópico |
| Database | Cilindro | Roxo | Nome do DB, tipo |

#### Animação de Pulso nas Edges

Durante simulação, quando uma mensagem flui de A→B:

1. Backend envia evento Mercure com `sourceNodeId`, `targetNodeId`, `status`
2. Frontend identifica a edge correspondente
3. Adiciona classe CSS ou SVG animation: um "pulso" (bolinha/glow) viaja ao longo do path da edge
4. Cor do pulso: verde (sucesso), vermelho (falha)
5. Ao chegar no destino, o nó pisca brevemente

Implementação: usar `<svg>` com `<animate>` ou CSS `offset-path` + `@keyframes` no `MessageEdge.vue`.

#### Mercure (Real-Time)

```typescript
// composables/useMercure.ts
export function useMercure(topic: string) {
  const events = ref<MessageEvent[]>([])
  const url = new URL('https://localhost/.well-known/mercure')
  url.searchParams.append('topic', topic)

  const eventSource = new EventSource(url)
  eventSource.onmessage = (event) => {
    events.value.push(JSON.parse(event.data))
  }

  onUnmounted(() => eventSource.close())
  return { events }
}
```

Tópicos a escutar durante simulação:

- `simulation/{id}/events` — eventos individuais (animar edges)
- `simulation/{id}/metrics` — métricas atualizadas
- `simulation/{id}/status` — status da simulação (running, completed, failed)

### Fluxo do Usuário

1. **Modelar** — Arrastar nós da paleta para o canvas, conectar com edges
2. **Configurar** — Clicar em edges para definir latência simulada e taxa de falha
3. **Salvar** — Salvar topologia no backend (POST `/api/topologies`)
4. **Simular** — Clicar "Simulate", backend orquestra RabbitMQ, frontend recebe eventos via Mercure
5. **Observar** — Ver pulsos animados nas edges, métricas em tempo real, log de eventos
6. **Analisar** — Após simulação, ver métricas históricas (throughput, latência, falhas por nó)
