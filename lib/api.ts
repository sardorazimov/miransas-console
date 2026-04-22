export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'include',
  })
  if (!res.ok) {
    if (res.status === 401) window.location.href = '/login'
    const err = await res.json().catch(() => ({ error: { message: 'unknown error' } }))
    throw new Error(err.error?.message || `${res.status}`)
  }
  return res.json()
}
