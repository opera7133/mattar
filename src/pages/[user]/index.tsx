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
  BsRssFill,
} from 'react-icons/bs'
import { useState, Fragment, useEffect } from 'react'
import twemoji from 'twemoji'
import type { GetServerSideProps } from 'next'
import prisma from 'lib/prisma'
import type { Mattar, User } from '@prisma/client'
import { io } from 'socket.io-client'
import * as linkify from 'linkifyjs'
import linkifyHtml from 'linkify-html'
import 'linkify-plugin-mention'
import 'linkify-plugin-hashtag'
import { useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Menu, Transition, Dialog } from '@headlessui/react'
import { useForm, SubmitHandler } from 'react-hook-form'
import Image from 'next/image'
import Mattars from 'components/Mattar'

type Props = {
  mattars: Mattar[]
  user?: User | undefined
  pUser: User
}

type Inputs = {
  id: string
  name: string
  avatar: string
  description: string
  location: string
  website: string
}

const Profile = (props: Props) => {
  const { data: session } = useSession()
  const router = useRouter()
  const page = router.query.page || 'mattars'
  const [state, setState] = useState(page)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [img, setImg] = useState(props.user?.profile_picture)
  const deleteMattar = async (id: string) => {
    await fetch('/api/statuses/destroy/' + id, {
      method: 'DELETE',
    })
  }
  const linkifyOptions = {
    className: function (_href: string, type: string) {
      return 'text-sky-500'
    },
    formatHref: {
      hashtag: (href: string) => 'search?query=' + href.substring(1),
      mention: (href: string) => href,
    },
    target: {
      url: '_blank',
    },
    nl2br: true,
    defaultProtocol: 'https',
  }
  const getElapsedTime = (date: Date | string) => {
    const newDate = typeof date === 'string' ? new Date(date) : date
    const today = new Date()
    const diff = today.getTime() - newDate.getTime()
    const elapsed = new Date(diff)
    if (
      elapsed.getUTCFullYear() &&
      newDate.getFullYear() !== today.getFullYear()
    ) {
      return (
        newDate.getFullYear() +
        '年' +
        (newDate.getMonth() + 1) +
        '月' +
        newDate.getDate() +
        '日'
      )
    } else if (elapsed.getUTCDate() - 1) {
      return newDate.getMonth() + 1 + '月' + newDate.getDate() + '日'
    } else if (elapsed.getUTCHours()) {
      return elapsed.getUTCHours() + '時間前'
    } else if (elapsed.getUTCMinutes()) {
      return elapsed.getUTCMinutes() + '分前'
    } else {
      return 'たった今'
    }
  }
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Inputs>()

  const refreshData = () => {
    router.replace(router.asPath)
  }

  const setPage = (name: string) => {
    setState(name)
    router.query.page = name
    router.push(router)
  }

  const followState = async () => {
    if (
      props.user?.following
        .map(function (i: any) {
          return i.id
        })
        .includes(props.pUser.id)
    ) {
      const res = await fetch(
        `/api/friendships/destroy?user_id=${props.user?.id}&unfollow_user_id=${props.pUser.id}`
      )
    } else {
      const ref = await fetch(
        `/api/friendships/create?user_id=${props.user?.id}&follow_user_id=${props.pUser.id}`
      )
    }
    refreshData()
  }

  const showModal = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      e.preventDefault()
    }
    if (isModalOpen) {
      setImg(props.user?.profile_picture)
      setIsModalOpen(false)
    } else {
      setIsModalOpen(true)
    }
  }
  const onChangeInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (e: any) => {
        setImg(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  const reMattar = async (id: string) => {
    const res = await fetch(
      `/api/statuses/remattar?user_id=${props.user.id}&mattar_id=${id}&source=Mattar Web Client`,
      {
        method: 'POST',
      }
    )
    refreshData()
  }
  const favMattar = async (id: string) => {
    await fetch(
      `/api/favorites/create?user_id=${props.user.id}&mattar_id=${id}`,
      {
        method: 'POST',
      }
    )
    refreshData()
  }
  const disfavMattar = async (id: string) => {
    await fetch(
      `/api/favorites/destroy?user_id=${props.user.id}&mattar_id=${id}`,
      {
        method: 'POST',
      }
    )
    refreshData()
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const res = await fetch('/api/account/update_profile', {
      body: JSON.stringify({
        oldId: props.user?.id,
        id: data.id,
        name: data.name,
        description: data.description,
        location: data.location,
        website: data.website,
        profile_picture: img,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const { error } = await res.json()
    if (error) {
      console.log(error)
      return
    }
    setIsModalOpen(false)
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
          {props.pUser.name} ({props.pUser.id}) on mattar.li
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
          <div className="my-6">
            <div className="relative flex gap-4">
              <div className="mt-2 w-28 h-28 relative">
                <Image
                  src={props.pUser.profile_picture || '/img/default.png'}
                  layout="fill"
                  objectFit="cover"
                  className="shrink-0"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{props.pUser.name}</h1>
                <h2 className="text-xl font-bold">
                  @{props.pUser.id}{' '}
                  {props.pUser.location && (
                    <span className="font-normal text-base">
                      in {props.pUser.location}
                    </span>
                  )}
                </h2>
                <p>{props.pUser.description}</p>
                <div className="absolute right-5 bottom-0">
                  <Link href={`/${props.pUser.id}/feed`}>
                    <a>
                      <BsRssFill size={23} className="fill-orange-500" />
                    </a>
                  </Link>
                </div>
                {props.user?.id === props.pUser.id ? (
                  <Button
                    className="absolute top-2 right-5 bg-primary text-white px-4 py-2 shadow-md duration-200 hover:shadow-sm rounded-md"
                    onClick={() => showModal()}
                  >
                    プロフィールを編集
                  </Button>
                ) : (
                  <div>
                    <Button
                      className="absolute top-2 right-20 bg-primary text-white px-4 py-2 shadow-md duration-200 hover:shadow-sm rounded-md"
                      onClick={() => followState()}
                    >
                      {props.user?.following
                        .map(function (i: any) {
                          return i.id
                        })
                        .includes(props.pUser.id)
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
                                        window.location.hostname === 'localhost'
                                          ? 'localhost:3000'
                                          : window.location.hostname
                                      }/${props.pUser.id}`
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
                )}

                <Transition appear show={isModalOpen} as={Fragment}>
                  <Dialog
                    className="relative z-10"
                    onClose={() => setIsOpen(false)}
                  >
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                      <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                          as={Fragment}
                          enter="ease-out duration-300"
                          enterFrom="opacity-0 scale-95"
                          enterTo="opacity-100 scale-100"
                          leave="ease-in duration-200"
                          leaveFrom="opacity-100 scale-100"
                          leaveTo="opacity-0 scale-95"
                        >
                          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title
                              as="h3"
                              className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                            >
                              プロフィールを編集
                            </Dialog.Title>
                            <form
                              className="my-3"
                              onSubmit={handleSubmit(onSubmit)}
                            >
                              <div className="flex flex-col mb-2">
                                <label htmlFor="id">ユーザー名</label>
                                <input
                                  type="text"
                                  id="id"
                                  {...register('id', {
                                    required: true,
                                  })}
                                  className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                                  defaultValue={props.user?.id}
                                />
                              </div>
                              <div className="flex flex-col mb-2">
                                <label htmlFor="name">表示名</label>
                                <input
                                  type="text"
                                  id="name"
                                  {...register('name', {
                                    required: true,
                                  })}
                                  defaultValue={props.user?.name}
                                  className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                                />
                              </div>
                              <div className="flex flex-col mb-2">
                                <label htmlFor="avatar">アバター</label>
                                <div className="flex flex-row">
                                  <div className="w-28 h-28 relative">
                                    <Image
                                      layout="fill"
                                      objectFit="cover"
                                      src={img || '/img/default.png'}
                                      alt="avatar"
                                    />
                                  </div>
                                  <div className="ml-3 inline-flex gap-3 flex-col">
                                    <label className="cursor-pointer text-center bg-primary text-white px-4 py-2 block rounded-md duration-200 shadow-md hover:shadow-sm">
                                      <input
                                        type="file"
                                        {...register('avatar')}
                                        onChange={(e) => onChangeInputFile(e)}
                                        className="hidden"
                                      />
                                      アップロード
                                    </label>
                                    <Button
                                      onClick={() => setImg('/img/default.png')}
                                      className="bg-primary text-white shadow-md duration-200 block px-4 py-2 rounded-md hover:shadow-sm"
                                    >
                                      デフォルトに戻す
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col mb-2">
                                <label htmlFor="description">概要</label>
                                <textarea
                                  {...register('description')}
                                  id="description"
                                  defaultValue={props.user?.description}
                                  className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                                ></textarea>
                              </div>
                              <div className="flex flex-col mb-2">
                                <label htmlFor="location">場所</label>
                                <input
                                  type="text"
                                  id="location"
                                  {...register('location')}
                                  className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                                  defaultValue={props.user?.location}
                                />
                              </div>
                              <div className="flex flex-col mb-2">
                                <label htmlFor="website">ウェブサイト</label>
                                <input
                                  type="text"
                                  id="website"
                                  {...register('website', {
                                    pattern:
                                      /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
                                  })}
                                  className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                                  defaultValue={props.user?.website}
                                />
                              </div>
                              <div className="mt-4 text-right">
                                <Button
                                  className="rounded-md bg-primary text-white shadow-md duration-200 px-4 py-2 hover:shadow-sm"
                                  onClick={(e) => showModal(e)}
                                >
                                  キャンセル
                                </Button>
                                <input
                                  type="submit"
                                  value="更新"
                                  className="cursor-pointer ml-3 rounded-md bg-primary text-white shadow-md duration-200 px-4 py-2 hover:shadow-sm"
                                  onClick={() => {}}
                                />
                              </div>
                            </form>
                          </Dialog.Panel>
                        </Transition.Child>
                      </div>
                    </div>
                  </Dialog>
                </Transition>
              </div>
            </div>
            <hr className="my-3" />
            <div className="flex flex-col gap-1">
              {props.mattars.map((item) => {
                if (state === 'mattars') {
                  return <Mattars item={item} props={props} key={item.id} />
                } else if (state === 'fav') {
                  if (
                    item.favorites
                      .map(function (i: any) {
                        return i.userId
                      })
                      .includes(props.user?.id)
                  )
                    return <Mattars item={item} props={props} key={item.id} />
                } else if (state === 'remattars') {
                  if (item.isRemattar)
                    return <Mattars item={item} props={props} key={item.id} />
                }
              })}
              {state === 'following' &&
                props.pUser.following.map((item) => {
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
                          onClick={() => followState()}
                        >
                          {props.user?.following
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
                                          }/${props.pUser.id}`
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
                props.pUser.follower.map((item) => {
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
                          onClick={() => followState()}
                        >
                          {props.user?.following
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
                                          }/${props.pUser.id}`
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
              <Link href={`/${props.pUser.id}`}>
                <a>
                  <div className="px-3 flex gap-3 items-center">
                    <div className="mt-2 w-16 h-16 relative">
                      <Image
                        src={props.pUser.profile_picture || '/img/default.png'}
                        layout="fill"
                        objectFit="cover"
                        className="shrink-0"
                      />
                    </div>
                    <div>
                      <p className="font-bold">{props.pUser.name}</p>
                      <p>
                        {props.pUser.mattar_count}
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
                            {props.pUser.following.length}
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
                            {props.pUser.follower.length}
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
                  onClick={() => setPage('mattars')}
                  className={`text-left px-3 py-1 duration-300 ${
                    state === 'mattars'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-zinc-500'
                  }`}
                >
                  ツイート
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
  const qUser = ctx.query.user
  const session = await getSession(ctx)
  if (session && session.user && session.user.id) {
    const mattars = JSON.parse(
      JSON.stringify(
        await prisma.mattar.findMany({
          where: {
            userId: qUser,
          },
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
          },
        })
      )
    )
    const pUser = JSON.parse(
      JSON.stringify(
        await prisma.user.findUnique({
          where: {
            id: qUser,
          },
          include: {
            follower: true,
            following: true,
          },
        })
      )
    )
    if (!pUser) {
      return {
        notFound: true,
      }
    }
    return {
      props: {
        user,
        pUser,
        mattars,
      },
    }
  } else {
    const mattars = JSON.parse(
      JSON.stringify(
        await prisma.mattar.findMany({
          where: {
            userId: qUser,
          },
          include: { user: true, favorites: true },
          orderBy: {
            createdAt: 'desc',
          },
        })
      )
    )
    const pUser = JSON.parse(
      JSON.stringify(
        await prisma.user.findUnique({
          where: {
            id: qUser,
          },
          include: {
            follower: true,
            following: true,
          },
        })
      )
    )
    if (!pUser) {
      return {
        notFound: true,
      }
    }
    return {
      props: {
        mattars,
        pUser,
      },
    }
  }
}

export default Profile
