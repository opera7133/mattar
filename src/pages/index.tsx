import Head from 'next/head'
import Link from 'next/link'
import Header from 'components/Header'
import Footer from 'components/Footer'
import Button from 'components/Button'
import { BsSearch, BsThreeDots } from 'react-icons/bs'
import { useState, useEffect } from 'react'
import stringWidth from 'string-width'
import type { GetServerSideProps } from 'next'
import prisma from 'lib/prisma'
import type { Prisma } from '@prisma/client'
import Image from 'next/image'
import { io } from 'socket.io-client'
import { useSession, getSession, getCsrfToken } from 'next-auth/react'
import { useRouter } from 'next/router'
import { IndexHome } from 'components/index/Home'
import { IndexFollowing } from 'components/index/Following'
import { IndexFollower } from 'components/index/Follower'
import { Layout } from 'components/Layout'
import { toast } from 'react-hot-toast'

type UserWithToken = Prisma.UserGetPayload<{
  include: {
    apiCredentials: true
    follower: {
      include: {
        follower: true
        following: true
      }
    }
    following: {
      include: {
        follower: true
        following: true
      }
    }
    favorites: true
  }
}>

type MattarWithFav = Prisma.MattarGetPayload<{
  include: {
    favorites: true
    user: true
  }
}>

type Props = {
  mattars: MattarWithFav[]
  user: UserWithToken | undefined
  csrfToken: string
}

const Home = (props: Props) => {
  const [text, setText] = useState('')
  const [searchText, setSearchText] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const page = router.query.page || 'home'
  const [state, setState] = useState(page || 'home')
  const refreshData = () => {
    router.replace(router.asPath)
  }
  const checkTextArea = (e: any) => {
    const newText = e.target.value.replace(/\n/g, '')
    setText(e.target.value)
  }
  const postMattar = async () => {
    if (props.user && props.user.apiCredentials) {
      const res = await (
        await fetch(
          `/api/statuses/update?api_token=${props.user?.apiCredentials.token}&api_secret=${props.user?.apiCredentials.secret}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: text,
              source: 'Mattar Web Client',
              userId: props.user?.id,
              isRemattar: false,
            }),
          }
        )
      ).json()
      if (res.error) {
        if (res.error === 'Your message is too long') {
          toast.error('ツイートが長すぎます！')
        } else if (res.error === 'The message must have some text') {
          toast.error('テキストを入力してください！')
        } else {
          toast.error(res.error)
        }
      } else {
        toast.success('ツイートを投稿しました！')
        setText('')
        refreshData()
      }
    }
  }
  const setPage = (name: string) => {
    setState(name)
    router.query.page = name
    router.push(router)
  }
  useEffect((): any => {
    if (props.user && props.user.apiCredentials) {
      const socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
        path: '/api/statuses/filter',
        extraHeaders: {
          'x-api-key': `${props.user.apiCredentials.token}`,
          'x-api-secret': `${props.user.apiCredentials.secret}`,
        },
      })
      socket.on('connect', () => {})
      socket.on(`message`, (message: string) => {
        refreshData()
      })
      if (socket) return () => socket.disconnect()
    } else {
      setPage('home')
    }
  }, [props.user, refreshData])

  interface Titles {
    [key: string]: string
  }
  const titles: Titles = {
    home: 'ホーム',
    at: 'メンション',
    fav: 'お気に入り',
    remattars: 'リツイート',
    follower: 'フォロワー',
    following: 'フォロー中',
  }
  return (
    <Layout>
      <Head>
        <title>
          {state.toString() in titles
            ? `${titles[state.toString()]} / mattar.li`
            : 'mattar.li'}
        </title>
      </Head>
      <main className="px-4 mx-auto max-w-6xl grid grid-cols-3 gap-6">
        <div className="col-span-3 lg:col-span-2 py-4">
          {session ? (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xl my-2">いま、どうしてる？</p>
                <p
                  className={
                    60 - stringWidth(text.replace(/\n/g, '')) < 0
                      ? 'font-bold text-3xl opacity-80 text-red-500'
                      : 'font-bold text-3xl opacity-40'
                  }
                >
                  {60 - stringWidth(text.replace(/\n/g, ''))}
                </p>
              </div>
              <textarea
                onChange={checkTextArea}
                value={text}
                className="rounded-md focus:ring-0 focus:border-gray-500 w-full h-auto text-black"
              ></textarea>
              <Button
                id="post"
                className="block ml-auto bg-primary text-white px-4 py-2 rounded-md shadow-md hover:shadow-sm duration-200"
                onClick={() => postMattar()}
              >
                つぶやく
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">mattar.liへようこそ</h1>
                <p className="my-2">平穏なインターネットを体感しよう。</p>
              </div>
              <Link
                href="/signup"
                className="bg-primary text-white px-4 py-2 rounded-md shadow-md hover:shadow-sm duration-200"
              >
                登録
              </Link>
            </div>
          )}
          <div className="my-6">
            <h3 className="text-xl">
              {state === 'home' && 'ホーム'}
              {state === 'at' && '@' + props.user?.id}
              {state === 'fav' && 'お気に入り'}
              {state === 'remattars' && 'リツイート'}
            </h3>
            <hr className="my-3" />
            <div className="flex flex-col gap-1">
              <IndexHome props={props} state={state.toString()} />
              <IndexFollowing props={props} state={state.toString()} />
              <IndexFollower props={props} state={state.toString()} />
            </div>
          </div>
        </div>
        <div className="col-span-3 lg:col-span-1 py-4">
          {session && (
            <div>
              <Link href={`/${props.user?.id}`}>
                <div className="px-3 flex gap-3 items-center">
                  <div className="w-16 h-16 relative">
                    <Image
                      src={props.user?.profile_picture || '/img/default.png'}
                      fill={true}
                      alt={`${props.user?.name}\'s Avatar`}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold">{props.user?.name}</p>
                    <p>
                      {props.user?.mattar_count}
                      のつぶやき
                    </p>
                  </div>
                </div>
              </Link>
              <table className="my-3 border-separate border-spacing-x-2.5">
                <tbody>
                  <tr>
                    <td>
                      <Button
                        className="text-left"
                        onClick={() => setPage('following')}
                      >
                        <div>
                          <p className="font-bold">
                            {props.user?.following.length}
                          </p>
                          <p>フォロー中</p>
                        </div>
                      </Button>
                    </td>
                    <td>
                      <Button
                        className="text-left"
                        onClick={() => setPage('follower')}
                      >
                        <div>
                          <p className="font-bold">
                            {props.user?.follower.length}
                          </p>
                          <p>フォロワー</p>
                        </div>
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex flex-col">
                <button
                  onClick={() => setPage('home')}
                  className={`text-left px-3 py-1 duration-300 ${
                    state === 'home'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-zinc-500'
                  }`}
                >
                  ホーム
                </button>
                <button
                  onClick={() => setPage('at')}
                  className={`text-left px-3 py-1 duration-300 ${
                    state === 'at'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-zinc-500'
                  }`}
                >
                  @{props.user?.id}
                </button>
                <button
                  onClick={() => setPage('fav')}
                  className={`text-left px-3 py-1 duration-300 ${
                    state === 'fav'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-zinc-500'
                  }`}
                >
                  お気に入り
                </button>
                <button
                  onClick={() => setPage('remattars')}
                  className={`text-left px-3 py-1 duration-300 ${
                    state === 'remattars'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-zinc-500'
                  }`}
                >
                  リツイート
                </button>
              </div>
              <div className="my-4 px-3 flex">
                <input
                  placeholder="検索"
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      router.push(`/search?query=${searchText}`)
                    }
                  }}
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

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const session = await getSession(ctx)
  if (session && session.user) {
    const mattars = JSON.parse(
      JSON.stringify(
        await prisma.mattar.findMany({
          include: { user: true, favorites: true },
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
            following: true,
            follower: true,
            apiCredentials: true,
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
          include: { user: true, favorites: true },
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

export default Home
