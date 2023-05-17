import Footer from 'components/Footer'
import { Layout } from 'components/Layout'
import Head from 'next/head'

export default function FAQ() {
  return (
    <Layout>
      <Head>
        <title>FAQ | mattar.li</title>
      </Head>
      <article className="pt-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">FAQ</h1>
        <details>
          <summary>
            Q. 問題のあるつぶやきを見つけました。どこに報告すればいいですか？
          </summary>
          <p className="mt-2">
            A.{' '}
            <a
              href="https://forms.gle/uWvyJWDPGtMoqpzj7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 duration-200 hover:text-sky-700"
            >
              こちら
            </a>
            からご報告ください。
          </p>
        </details>
      </article>
      <Footer />
    </Layout>
  )
}
