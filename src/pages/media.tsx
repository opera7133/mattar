import Footer from 'components/Footer'
import { Layout } from 'components/Layout'
import Head from 'next/head'
import Image from 'next/image'

export default function Media() {
  return (
    <Layout>
      <Head>
        <title>メディア | mattar.li</title>
      </Head>
      <article className="pt-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
        <h1 className="text-4xl font-bold mb-3">メディア</h1>
        <p className="text-lg mb-5">Mattarのブランドに関するページです。</p>
        <h2 className="text-2xl font-bold mb-3">アイコン</h2>
        <div className="rounded-md relative py-5 px-16 inline-block bg-[url('https://assets-global.website-files.com/6257adef93867e50d84d30e2/62594f6abf11bb058da52ecb_bg.png')] dark:bg-[url('https://assets-global.website-files.com/6257adef93867e50d84d30e2/625950f8da1880cda1a94346_bg-w.png')]">
          <div className="mx-16 my-5 relative w-32 h-32">
            <Image
              src="/img/logo/mattarli.svg"
              layout="fill"
              objectFit="cover"
              alt="Mattar Icon"
            />
          </div>
          <a
            href="/img/logo/mattarli.png"
            download="mattar.png"
            className="absolute right-14 bottom-2 text-sky-500 duration-200 hover:text-sky-700"
          >
            .png
          </a>
          <a
            href="/img/logo/mattarli.svg"
            download="mattar.svg"
            className="absolute right-4 bottom-2 text-sky-500 duration-200 hover:text-sky-700"
          >
            .svg
          </a>
        </div>
        <h2 className="text-2xl font-bold my-3">ロゴ</h2>
        <div className="rounded-md relative py-5 px-16 inline-block bg-[url('https://assets-global.website-files.com/6257adef93867e50d84d30e2/625950f8da1880cda1a94346_bg-w.png')]">
          <div className="mx-4 my-5 relative w-56 h-16">
            <Image
              src="/img/logo/mattarli-light.svg"
              layout="fill"
              objectFit="cover"
              alt="Mattar Icon"
            />
          </div>
          <a
            href="/img/logo/mattarli-light.png"
            download="mattar.png"
            className="absolute right-14 bottom-2 text-sky-500 duration-200 hover:text-sky-700"
          >
            .png
          </a>
          <a
            href="/img/logo/mattarli-light.svg"
            download="mattar.svg"
            className="absolute right-4 bottom-2 text-sky-500 duration-200 hover:text-sky-700"
          >
            .svg
          </a>
        </div>
        <div className="rounded-md ml-4 relative py-5 px-16 inline-block bg-[url('https://assets-global.website-files.com/6257adef93867e50d84d30e2/62594f6abf11bb058da52ecb_bg.png')]">
          <div className="mx-4 my-5 relative w-56 h-16">
            <Image
              src="/img/logo/mattarli-dark.svg"
              layout="fill"
              objectFit="cover"
              alt="Mattar Icon"
            />
          </div>
          <a
            href="/img/logo/mattarli-dark.png"
            download="mattar.png"
            className="absolute right-14 bottom-2 text-sky-500 duration-200 hover:text-sky-700"
          >
            .png
          </a>
          <a
            href="/img/logo/mattarli-dark.svg"
            download="mattar.svg"
            className="absolute right-4 bottom-2 text-sky-500 duration-200 hover:text-sky-700"
          >
            .svg
          </a>
        </div>
        <h2 className="text-2xl font-bold my-3">色</h2>

        <div className="mb-20">
          <div className="rounded-md bg-primary text-white inline-block p-6 w-80">
            <p className="font-bold text-xl pb-12">Dark Blue</p>
            <p className="text-lg">#002F55</p>
            <p className="text-lg">CMYK 100, 45, 0, 67</p>
          </div>
          <div className="ml-5 rounded-md bg-[#dcdddd] text-black inline-block p-6 w-80">
            <p className="font-bold text-xl pb-12">Gray</p>
            <p className="text-lg">#DCDDDD</p>
            <p className="text-lg">CMYK 0, 0, 0, 13</p>
          </div>
          <div className="ml-5 rounded-md bg-white text-black inline-block p-6 w-80">
            <p className="font-bold text-xl pb-12">White</p>
            <p className="text-lg">#FFFFFF</p>
            <p className="text-lg">CMYK 0, 0, 0, 0</p>
          </div>
        </div>
      </article>
      <Footer />
    </Layout>
  )
}
