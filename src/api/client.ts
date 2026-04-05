const BASE_URL = 'https://localhost'

interface ApiError {
  status: number,
  message: string,
  violations?: { propertyPath: string, title: string }[]
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${BASE_URL}${endpoint}`,
    {
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
        ...options.headers
      },
      ...options,
    }
  );

  if(!response.ok) {
    const body = await response.json().catch(() => null);

    const error: ApiError = {
      status: response.status,
      message: body?.detail ?? body?.title ?? response.statusText,
      violations: body?.violations
    }

    throw error;
  }

  if(response.status === 204) {
    return null as T;
  }

  return response.json();
}

