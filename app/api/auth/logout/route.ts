import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set(process.env.MIRANSAS_COOKIE_NAME || 'miransas_jwt', '', {
    maxAge: 0,
    path: '/',
  })
  return Response.json({ ok: true })
}
