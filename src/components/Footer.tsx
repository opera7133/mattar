import Link from 'next/link'

function Footer() {
  return (
    <footer className="max-w-6xl mx-auto">
      <hr />
      <ul className="my-3 flex flex-wrap gap-2 list-none text-sm">
        <li>
          <Link href="/about">mattar.liについて</Link>
        </li>
        <li>
          <Link href="/faq">FAQ</Link>
        </li>
        <li>
          <a
            href="https://blog-mattar.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            ブログ
          </a>
        </li>
        <li>
          <Link href="/tos">利用規約</Link>
        </li>
        <li>
          <Link href="/privacy">プライバシーポリシー</Link>
        </li>
        <li>
          <Link href="/media">メディア</Link>
        </li>
      </ul>
    </footer>
  )
}

export default Footer
