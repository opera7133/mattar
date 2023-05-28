import Head from 'next/head'
import Link from 'next/link'
import Footer from 'components/Footer'
import Button from 'components/Button'
import { BsSearch } from 'react-icons/bs'
import { useState } from 'react'
import type { GetServerSideProps } from 'next'
import prisma from 'lib/prisma'
import type { Prisma } from '@prisma/client'
import { useSession, getSession, getCsrfToken } from 'next-auth/react'
import { useRouter } from 'next/router'
import Mattars from 'components/Mattar'
import { Layout } from 'components/Layout'

type MattarWithFav = Prisma.MattarGetPayload<{
  include: {
    attaches: true
    favorites: true
    user: true
  }
}>

type UserWithToken = Prisma.UserGetPayload<{
  include: {
    apiCredentials: true
    follower: true
    following: true
    favorites: true
  }
}>

type Props = {
  mattars: MattarWithFav[]
  user?: UserWithToken | undefined
  csrfToken: string
}

const Search = (props: Props) => {
  const router = useRouter()
  const [searchText, setSearchText] = useState(router.query.query || '')
  const { data: session } = useSession()
  return (
    <Layout>
      <Head>
        <title>mattar.li</title>
        <meta name="description" content="Generated by create next app" />
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
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/img/favicon/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <meta name="msapplication-TileColor" content="#2b5797" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <main className="px-4 mx-auto max-w-6xl grid grid-cols-3 gap-6">
        <div className="col-span-3 lg:col-span-2 py-4">
          {!session && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">mattar.liへようこそ</h1>
                <p className="my-2">平穏なインターネットを体感しよう。</p>
              </div>
              <Link href="/signup">
                <a className="bg-primary text-white px-4 py-2 rounded-md shadow-md hover:shadow-sm duration-200">
                  登録
                </a>
              </Link>
            </div>
          )}
          <div className="my-6">
            <h3 className="text-xl">検索</h3>
            <hr className="my-3" />
            <div className="flex flex-col gap-1">
              {props.mattars.map((item) => {
                return <Mattars item={item} props={props} key={item.id} />
              })}
            </div>
          </div>
        </div>
        <div className="col-span-3 lg:col-span-1 py-4">
          {session && (
            <div>
              <div className="px-3 flex gap-3 items-center">
                <img src={props.user?.profile_picture || ''} className="w-12" />
                <div>
                  <p className="font-bold">{props.user?.name}</p>
                  <p>
                    {props.user?.mattar_count}
                    のつぶやき
                  </p>
                </div>
              </div>
              <table className="my-3 border-separate border-spacing-x-2.5">
                <tbody>
                  <tr>
                    <td>
                      <Link href="/?page=following">
                        <a>
                          <p className="font-bold">
                            {props.user?.following
                              ? props.user.following.length
                              : '0'}
                          </p>
                          <p>フォロー中</p>
                        </a>
                      </Link>
                    </td>
                    <td>
                      <Link href="/?page=follower">
                        <a>
                          <p className="font-bold">
                            {props.user?.follower
                              ? props.user.follower.length
                              : '0'}
                          </p>
                          <p>フォロワー</p>
                        </a>
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex flex-col">
                <Link href="/">
                  <a className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500">
                    ホーム
                  </a>
                </Link>
                <Link href="/?page=at">
                  <a className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500">
                    @{props.user?.id}
                  </a>
                </Link>
                <Link href="/?page=fav">
                  <a className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500">
                    お気に入り
                  </a>
                </Link>
                <Link href="/?page=remattars">
                  <a className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500">
                    リツイート
                  </a>
                </Link>
              </div>
              <div className="my-4 px-3 flex">
                <input
                  placeholder="検索"
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="text-black w-full h-9 rounded-md rounded-r-none focus:ring-0 focus:border-gray-500 border-r-0"
                />
                <Button
                  className="bg-primary px-3 h-9 border border-primary rounded-md rounded-l-none hover:opacity-80 duration-300"
                  onClick={() => router.push(`/search?query=${searchText}`)}
                >
                  <BsSearch className="fill-white" size={18} />
                </Button>
              </div>
            </div>
          )}
          <Footer />
        </div>
      </main>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const query = ctx.query.query
  const session = await getSession(ctx)
  if (query) {
    if (session && session.user && session.user.id) {
      const mattars = JSON.parse(
        JSON.stringify(
          await prisma.mattar.findMany({
            where: {
              message: {
                contains: query.toString(),
              },
            },
            include: { user: true, favorites: true, attaches: true },
            orderBy: {
              createdAt: 'desc',
            },
          })
        )
      )
      const user = JSON.parse(
        JSON.stringify(
          await prisma.user.findUnique({
            where: {
              id: session.user.id,
            },
            include: {
              favorites: true,
            },
          })
        )
      )
      return {
        props: {
          user,
          mattars,
          csrfToken: await getCsrfToken(ctx),
        },
      }
    } else {
      const mattars = JSON.parse(
        JSON.stringify(
          await prisma.mattar.findMany({
            where: {
              message: {
                contains: query.toString(),
              },
            },
            include: { user: true, favorites: true, attaches: true },
            orderBy: {
              createdAt: 'desc',
            },
          })
        )
      )
      return {
        props: {
          mattars,
          csrfToken: await getCsrfToken(ctx),
        },
      }
    }
  } else {
    const mattars = JSON.parse(
      JSON.stringify(
        await prisma.mattar.findMany({
          include: { user: true, favorites: true, attaches: true },
          orderBy: {
            createdAt: 'desc',
          },
        })
      )
    )
    return {
      props: {
        mattars,
        csrfToken: await getCsrfToken(ctx),
      },
    }
  }
}

export default Search
