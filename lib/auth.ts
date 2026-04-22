import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getJwt() {
  const cookieStore = await cookies()
  return cookieStore.get(process.env.MIRANSAS_COOKIE_NAME || 'miransas_jwt')?.value
}

export async function requireAuth() {
  const jwt = await getJwt()
  if (!jwt) redirect('/login')
  return jwt
}
