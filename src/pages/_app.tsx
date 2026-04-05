import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { Analytics } from '@vercel/analytics/react'
import '../app/globals.css'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Analytics />
    </SessionProvider>
  )
}
