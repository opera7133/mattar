import Footer from 'components/Footer'
import Header from 'components/Header'
import { Layout } from 'components/Layout'
import getConfig from 'next/config'
import Head from 'next/head'

export default function About() {
  const { publicRuntimeConfig } = getConfig()
  const version = publicRuntimeConfig?.version
  return (
    <Layout>
      <Head>
        <title>mattar.liについて | mattar.li</title>
      </Head>
      <article className="pt-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
        <h2 className="text-2xl font-bold mb-4">mattar.liについて</h2>
        <p className="text-lg mb-5">
          mattar.liは、殺伐としたインターネットをマターリ過ごすためのマイクロブログです。
          <br />
          ベイクドモチョチョの呼び名を議論できる平穏なSNSを目指して運営しています。
        </p>
        <h2 className="text-2xl font-bold mb-4">mattarについて</h2>
        <p className="text-lg mb-5">
          mattar.liを運営するために開発した簡易SNSソフトウェアです。
        </p>
        <h2 className="text-2xl font-bold mb-4">開発・運営</h2>
        <div className="flex items-center gap-5">
          <img src="https://github.com/opera7133.png" className="w-20" />
          <div className="pb-2">
            <p className="text-xl">@wamo</p>
            <a
              href="https://wmsci.com"
              className="underline text-sky-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://wmsci.com
            </a>
          </div>
        </div>
        <h2 className="text-2xl font-bold my-4">ソフトウェア情報</h2>
        <a
          href="https://github.com/opera7133/mattar"
          rel="noopener noreferrer"
          target="_blank"
        >
          バージョン：<span className="font-mono">{version}</span>
        </a>
      </article>
      <Footer />
    </Layout>
  )
}
