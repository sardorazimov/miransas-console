import { redirect } from 'next/navigation'
import { getJwt } from './auth'

export async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const jwt = await getJwt()
  const res = await fetch(`${process.env.MIRANSAS_BACKEND_URL}/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
      ...init?.headers,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    if (res.status === 401) redirect('/login')
    throw new Error(`${res.status}: ${await res.text()}`)
  }
  return res.json()
}

export const serverApi = {
  get: <T>(path: string) => serverFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    serverFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    serverFetch<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => serverFetch<T>(path, { method: 'DELETE' }),
}
