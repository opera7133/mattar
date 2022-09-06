import Footer from 'components/Footer'
import Header from 'components/Header'
import Head from 'next/head'

export default function About() {
  return (
    <div>
      <Head>
        <title>mattar.liについて | mattar.li</title>
      </Head>
      <Header />
      <article className="pt-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
        <h1 className="text-4xl font-bold mb-3">mattar.liについて</h1>
        <p className="text-lg mb-5">
          mattar.liは、殺伐としたインターネットをマターリ過ごすためのマイクロブログです。
          <br />
          ベイクドモチョチョの呼び名を議論できる平穏なSNSを目指して開発しています。
        </p>
        <h2 className="text-2xl font-bold mb-3">開発・運営</h2>
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
      </article>
      <Footer />
    </div>
  )
}
