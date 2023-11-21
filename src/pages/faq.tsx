import Footer from 'components/Footer'
import { Layout } from 'components/Layout'
import NextHeadSeo from 'next-head-seo'

export default function FAQ() {
  return (
    <Layout>
      <NextHeadSeo
        title="FAQ | mattar.li"
        description="よくある質問とその回答"
        og={{
          title: 'FAQ | mattar.li',
          image: process.env.NEXT_PUBLIC_BASE_URL + '/img/ogp.png',
        }}
      />
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
