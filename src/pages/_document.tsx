import Document, { Html, Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body className="dark:bg-zinc-800 dark:text-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
