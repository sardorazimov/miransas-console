import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const backendRes = await fetch(
    `${process.env.MIRANSAS_BACKEND_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: body.password }),
    }
  )

  if (!backendRes.ok) {
    const err = await backendRes.json().catch(() => ({}))
    return Response.json(err, { status: backendRes.status })
  }

  const data = await backendRes.json()
  const { token, expires_in } = data

  const cookieStore = await cookies()
  cookieStore.set(
    process.env.MIRANSAS_COOKIE_NAME || 'miransas_jwt',
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in,
      path: '/',
    }
  )

  return Response.json({ ok: true })
}
