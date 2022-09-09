import { Menu, Transition } from '@headlessui/react'
import Head from 'next/head'
import Link from 'next/link'
import Header from 'components/Header'
import Footer from 'components/Footer'
import Button from 'components/Button'
import {
  BsSearch,
  BsThreeDots,
  BsStar,
  BsReply,
  BsStarFill,
} from 'react-icons/bs'
import { useState, Fragment, useEffect } from 'react'
import stringWidth from 'string-width'
import twemoji from 'twemoji'
import type { GetServerSideProps } from 'next'
import prisma from 'lib/prisma'
import type { Mattar, User } from '@prisma/client'
import Image from 'next/image'
import { io } from 'socket.io-client'
import * as linkify from 'linkifyjs'
import linkifyHtml from 'linkify-html'
import 'linkify-plugin-mention'
import 'linkify-plugin-hashtag'
import { useSession, getSession, getCsrfToken } from 'next-auth/react'
import { useRouter } from 'next/router'
import Mattars from 'components/Mattar'

type Props = {
  mattars: Mattar[]
  user: User | undefined
  csrfToken: string
}

const Home = (props: Props) => {
  const [text, setText] = useState('')
  const [searchText, setSearchText] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const page = router.query.page || 'home'
  const [state, setState] = useState(page)
  const refreshData = () => {
    router.replace(router.asPath)
  }
  const checkTextArea = (e: any) => {
    const newText = e.target.value.replace(/\n/g, '')
    setText(e.target.value)
  }
  const postMattar = async () => {
    setText('')
    await fetch('/api/statuses/update', {
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
    })
    refreshData()
  }
  const setPage = (name: string) => {
    setState(name)
    router.query.page = name
    router.push(router)
  }
  const followState = async (id) => {
    if (
      props.user.following
        .map(function (i: any) {
          return i.id
        })
        .includes(id)
    ) {
      const res = await fetch(
        `/api/friendships/destroy?user_id=${props.user?.id}&unfollow_user_id=${id}`
      )
    } else {
      const ref = await fetch(
        `/api/friendships/create?user_id=${props.user?.id}&follow_user_id=${id}`
      )
    }
    refreshData()
  }
  useEffect((): any => {
    const socket = io('http://localhost:3000', {
      path: '/api/statuses/filter',
    })
    socket.on('connect', () => {})
    socket.on(`message`, (message: string) => {
      refreshData()
    })
    if (socket) return () => socket.disconnect()
  }, [refreshData])
  return (
    <div className="dark:bg-zinc-800 dark:text-white h-screen">
      <Head>
        <title>
          {state === 'home' ? 'ホーム' : ''}
          {state === 'at' ? 'メンション' : ''}
          {state === 'fav' ? 'お気に入り' : ''}
          {state === 'remattars' ? 'リツイート' : ''} / mattar.li
        </title>
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
      <Header />
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
              <Link href="/signup">
                <a className="bg-primary text-white px-4 py-2 rounded-md shadow-md hover:shadow-sm duration-200">
                  登録
                </a>
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
              {props.mattars.map((item) => {
                if (state === 'at') {
                  if (item.message.includes('@wamo')) {
                    return <Mattars item={item} props={props} key={item.id} />
                  }
                } else if (state === 'fav') {
                  if (
                    item.favorites
                      .map(function (i: any) {
                        return i.userId
                      })
                      .includes(props.user?.id)
                  ) {
                    return <Mattars item={item} props={props} key={item.id} />
                  }
                } else if (state === 'home') {
                  return <Mattars item={item} props={props} key={item.id} />
                } else if (state === 'remattars') {
                  if (item.isRemattar) {
                    return <Mattars item={item} props={props} key={item.id} />
                  }
                }
              })}
              {state === 'following' &&
                props.user.following.map((item) => {
                  return (
                    <article
                      className="flex gap-3 group relative"
                      key={item.id}
                    >
                      <div className="w-16 h-16 relative">
                        <Image
                          src={item.profile_picture}
                          alt={`${item.name}\'s Avatar`}
                          layout="fill"
                          objectFit="cover"
                          className="shrink-0"
                        />
                      </div>
                      <Link href={`/${item.id}`}>
                        <a>
                          <div>
                            <span className="font-bold text-lg block">
                              {item.name}
                            </span>
                            <span className="text-md">@{item.id}</span>
                          </div>
                        </a>
                      </Link>
                      <div>
                        <Button
                          className="absolute top-2 right-20 bg-primary text-white px-4 py-2 shadow-md duration-200 hover:shadow-sm rounded-md"
                          onClick={() => followState(item.id)}
                        >
                          {props.user.following
                            .map(function (i: any) {
                              return i.id
                            })
                            .includes(item.id)
                            ? 'フォロー中'
                            : 'フォロー'}
                        </Button>
                        <Menu as="div" className="inline-block text-left">
                          <div>
                            <Menu.Button className="absolute top-2 right-5 bg-primary text-white px-3.5 py-3 shadow-md duration-200 hover:shadow-sm rounded-md">
                              <BsThreeDots />
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-5 top-14 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="flex flex-col">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button className="duration-200 px-4 py-2 text-sm text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800">
                                      ミュート
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button className="duration-200 px-4 py-2 text-sm text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800">
                                      ブロック
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                              <div className="flex flex-col">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      className="duration-200 px-4 py-2 text-sm text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800"
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          `${window.location.protocol}://${
                                            window.location.hostname ===
                                            'localhost'
                                              ? 'localhost:3000'
                                              : window.location.hostname
                                          }/${item.id}`
                                        )
                                      }
                                    >
                                      リンクをコピー
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </article>
                  )
                })}
              {state === 'follower' &&
                props.user.follower.map((item) => {
                  return (
                    <article
                      className="flex gap-3 group relative"
                      key={item.id}
                    >
                      <div className="w-16 h-16 relative">
                        <Image
                          src={item.profile_picture}
                          alt={`${item.name}\'s Avatar`}
                          layout="fill"
                          objectFit="cover"
                          className="shrink-0"
                        />
                      </div>
                      <Link href={`/${item.id}`}>
                        <a>
                          <div>
                            <span className="font-bold text-lg block">
                              {item.name}
                            </span>
                            <span className="text-md">@{item.id}</span>
                          </div>
                        </a>
                      </Link>
                      <div>
                        <Button
                          className="absolute top-2 right-20 bg-primary text-white px-4 py-2 shadow-md duration-200 hover:shadow-sm rounded-md"
                          onClick={() => followState(item.id)}
                        >
                          {props.user.following
                            .map(function (i: any) {
                              return i.id
                            })
                            .includes(item.id)
                            ? 'フォロー中'
                            : 'フォロー'}
                        </Button>
                        <Menu as="div" className="inline-block text-left">
                          <div>
                            <Menu.Button className="absolute top-2 right-5 bg-primary text-white px-3.5 py-3 shadow-md duration-200 hover:shadow-sm rounded-md">
                              <BsThreeDots />
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-5 top-14 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <div className="flex flex-col">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button className="duration-200 px-4 py-2 text-sm text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800">
                                      ミュート
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button className="duration-200 px-4 py-2 text-sm text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800">
                                      ブロック
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                              <div className="flex flex-col">
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      className="duration-200 px-4 py-2 text-sm text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800"
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          `${window.location.protocol}://${
                                            window.location.hostname ===
                                            'localhost'
                                              ? 'localhost:3000'
                                              : window.location.hostname
                                          }/${item.id}`
                                        )
                                      }
                                    >
                                      リンクをコピー
                                    </button>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </article>
                  )
                })}
            </div>
          </div>
        </div>
        <div className="col-span-3 lg:col-span-1 py-4">
          {session && (
            <div>
              <Link href={`/${props.user?.id}`}>
                <a>
                  <div className="px-3 flex gap-3 items-center">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={props.user.profile_picture || '/img/default.png'}
                        layout="fill"
                        objectFit="cover"
                        alt={`${props.user.name}\'s Avatar`}
                      />
                    </div>
                    <div>
                      <p className="font-bold">{props.user.name}</p>
                      <p>
                        {props.user.mattar_count}
                        のつぶやき
                      </p>
                    </div>
                  </div>
                </a>
              </Link>
              <table className="my-3 border-separate border-spacing-x-2.5">
                <tbody>
                  <tr>
                    <td>
                      <Button
                        className="text-left"
                        onClick={() => setState('following')}
                      >
                        <div>
                          <p className="font-bold">
                            {props.user.following.length}
                          </p>
                          <p>フォロー中</p>
                        </div>
                      </Button>
                    </td>
                    <td>
                      <Button
                        className="text-left"
                        onClick={() => setState('follower')}
                      >
                        <div>
                          <p className="font-bold">
                            {props.user.follower.length}
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
    </div>
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
