import { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { Analytics } from '@vercel/analytics/react'
import Script from 'next/script'
import '../app/globals.css'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
      <Component {...pageProps} />
      <Analytics />
    </SessionProvider>
  )
}
