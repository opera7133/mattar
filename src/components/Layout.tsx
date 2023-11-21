import Head from 'next/head'
import Header from './Header'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="dark:bg-zinc-800 dark:text-white h-screen">
      <Head>
        <meta
          name="description"
          content="殺伐としたインターネットをマターリ過ごすためのマイクロブログ"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/img/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/img/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/img/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="mask-icon"
          href="/img/favicon/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="msapplication-TileColor" content="#2b5797" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Header />
      {children}
      <Toaster position="bottom-right" />
    </div>
  )
}
