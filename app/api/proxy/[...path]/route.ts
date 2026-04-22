import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

type RouteContext = { params: Promise<{ path: string[] }> }

async function handler(request: NextRequest, { params }: RouteContext) {
  const { path } = await params

  const cookieName = process.env.MIRANSAS_COOKIE_NAME || 'miransas_jwt'
  const cookieStore = await cookies()
  const jwt = cookieStore.get(cookieName)?.value

  const backendUrl = `${process.env.MIRANSAS_BACKEND_URL}/api/${path.join('/')}${request.nextUrl.search}`

  const method = request.method
  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(method)

  const backendRes = await fetch(backendUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    ...(hasBody ? { body: await request.text() } : {}),
  })

  if (backendRes.status === 401) {
    cookieStore.set(cookieName, '', { maxAge: 0, path: '/' })
    return Response.json({ error: { message: 'Unauthorized' } }, { status: 401 })
  }

  const contentType = backendRes.headers.get('content-type') ?? ''
  const body = contentType.includes('application/json')
    ? await backendRes.json()
    : await backendRes.text()

  const responseInit: ResponseInit = { status: backendRes.status }

  if (typeof body === 'string') {
    return new Response(body, responseInit)
  }
  return Response.json(body, responseInit)
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const HEAD = handler
