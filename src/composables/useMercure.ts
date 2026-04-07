import { ref } from 'vue'

const MERCURE_URL = 'https://localhost/.well-known/mercure'

export function useMercure<T>(topic: string, onMessage?: (data: T) => void) {
  const isConnected = ref(false)
  let eventSource: EventSource | null = null

  // Retorna uma Promise que resolve quando a conexão SSE está aberta
  function connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = new URL(MERCURE_URL)
      url.searchParams.append('topic', topic)

      eventSource = new EventSource(url)

      eventSource.onopen = () => {
        isConnected.value = true
        resolve()
      }

      eventSource.onmessage = (event) => {
        const parsed = JSON.parse(event.data) as T
        onMessage?.(parsed)
      }

      eventSource.onerror = () => {
        isConnected.value = false
        if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
          reject(new Error('Failed to connect to Mercure'))
        }
      }
    })
  }

  function disconnect() {
    eventSource?.close()
    eventSource = null
    isConnected.value = false
  }

  return { isConnected, connect, disconnect }
}
