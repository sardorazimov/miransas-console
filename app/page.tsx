import { redirect } from 'next/navigation'
import { getJwt } from '@/lib/auth'

export default async function RootPage() {
  const jwt = await getJwt()
  if (jwt) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
