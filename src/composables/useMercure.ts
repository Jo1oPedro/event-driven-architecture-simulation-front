import { onUnmounted, ref } from 'vue'

const MERCURE_URL = 'https://localhost/.well-known/mercure';

export function useMercure<T>(topic: string) {
  const data = ref<T[]>([]);
  const isConnected = ref(false);
  let eventSource: EventSource | null = null;

  function connect() {
    const url = new URL(MERCURE_URL);
    url.searchParams.append('topic', topic);

    eventSource = new EventSource(url);

    eventSource.onopen = () => {
      isConnected.value = true;
    }

    eventSource.onmessage = (event) => {
      const parsed =  JSON.parse(event.data) as T
      data.value.push(parsed);
    }

    eventSource.onerror = () => {
      isConnected.value = false;
    }
  }

  function disconnect() {
    eventSource?.close();
    eventSource = null;
    isConnected.value = false;
  }

  return { data, isConnected, connect, disconnect }
}
