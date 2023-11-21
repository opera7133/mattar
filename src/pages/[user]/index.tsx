import Head from 'next/head'
import Link from 'next/link'
import Footer from 'components/Footer'
import Button from 'components/Button'
import { BsSearch, BsThreeDots, BsRssFill, BsPencilFill } from 'react-icons/bs'
import { useState, Fragment, useEffect } from 'react'
import type { GetServerSideProps } from 'next'
import prisma from 'lib/prisma'
import type { Prisma } from '@prisma/client'
import { io } from 'socket.io-client'
import { useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Menu, Transition } from '@headlessui/react'
import Image from 'next/image'
import Mattars from 'components/Mattar'
import { Layout } from 'components/Layout'
import { UserProfile } from 'components/user/Profile'
import { UserFollower } from 'components/user/Follower'
import { UserFollowing } from 'components/user/Following'
import NextHeadSeo from 'next-head-seo'

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
    attaches: true
    favorites: true
    user: true
  }
}>

type Props = {
  mattars: MattarWithFav[]
  user?: UserWithToken | undefined
  pUser: UserWithToken
}

const Profile = (props: Props) => {
  const { data: session } = useSession()
  const router = useRouter()
  const page = router.query.page || 'mattars'
  const [state, setState] = useState(page)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  const refreshData = () => {
    router.replace(router.asPath)
  }

  const setPage = (name: string) => {
    setState(name)
    router.query.page = name
    router.push(router)
  }

  const followState = async (id: string) => {
    if (props.user && props.user.apiCredentials) {
      if (
        props.user?.following
          .map(function (i: any) {
            return i.id
          })
          .includes(props.pUser.id)
      ) {
        const res = await fetch(
          `/api/friendships/destroy?user_id=${props.user?.id}&unfollow_user_id=${id}&api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`
        )
      } else {
        const ref = await fetch(
          `/api/friendships/create?user_id=${props.user?.id}&follow_user_id=${id}&api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`
        )
      }
      refreshData()
    }
  }

  const showModal = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e) {
      e.preventDefault()
    }
    if (isModalOpen) {
      setIsModalOpen(false)
    } else {
      setIsModalOpen(true)
    }
  }

  useEffect((): any => {
    if (props.user && props.user.apiCredentials) {
      const socket = io(process.env.NEXT_PUBLIC_BASE_URL, {
        path: `/api/statuses/filter`,
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
    }
  }, [refreshData])

  return (
    <Layout>
      <NextHeadSeo
        title={`${props.pUser.name} (${props.pUser.id}) on mattar.li`}
        description={`${props.pUser.name}のプロフィール`}
        og={{
          title: `${props.pUser.name} (${props.pUser.id}) on mattar.li`,
          image: props.pUser.profile_picture || '/img/default.png',
        }}
        twitter={{
          card: 'summary',
        }}
      />
      <main className="px-4 mx-auto max-w-6xl grid grid-cols-3 gap-6">
        <div className="col-span-3 lg:col-span-2 py-4">
          <div className="my-6">
            <div className="relative flex gap-4">
              <div className="mt-2 w-28 h-28 relative">
                <Image
                  src={props.pUser.profile_picture || '/img/default.png'}
                  alt="profile"
                  fill={true}
                  className="object-cover shrink-0"
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
                <p>
                  <a
                    className="text-sky-500 hover:text-sky-600 duration-200"
                    href={props.pUser.website || ''}
                  >
                    {props.pUser.website}
                  </a>
                </p>
                <div className="absolute right-2 md:right-5 bottom-0">
                  <a target="_blank" href={`/${props.pUser.id}/feed`}>
                    <BsRssFill size={23} className="fill-orange-500" />
                  </a>
                </div>
                {props.user?.id === props.pUser.id ? (
                  <Button
                    id="edit"
                    className="absolute top-2 right-0 md:right-5 bg-primary text-white px-2.5 md:px-4 py-2.5 md:py-2 shadow-md duration-200 hover:shadow-sm rounded-md"
                    onClick={() => showModal()}
                  >
                    <span className="hidden md:block">プロフィールを編集</span>
                    <BsPencilFill className="md:hidden" />
                  </Button>
                ) : (
                  <div>
                    {session && (
                      <Button
                        className="absolute top-2 right-20 bg-primary text-white px-4 py-2 shadow-md duration-200 hover:shadow-sm rounded-md"
                        onClick={() => followState(props.pUser.id)}
                      >
                        {props.user?.following
                          .map(function (i: any) {
                            return i.id
                          })
                          .includes(props.pUser.id)
                          ? 'フォロー中'
                          : 'フォロー'}
                      </Button>
                    )}
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
                          {session && (
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
                          )}
                          <div className="flex flex-col">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  className="duration-200 px-4 py-2 text-sm text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800"
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      `${process.env.NEXT_PUBLIC_BASE_URL}/${props.pUser.id}`
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
                <UserProfile
                  props={props}
                  isModalOpen={isModalOpen}
                  setIsModalOpen={setIsModalOpen}
                  showModal={showModal}
                />
              </div>
            </div>
            <hr className="my-3" />
            <div className="flex flex-col gap-1">
              {props.mattars.map((item) => {
                if (state === 'mattars' && item.userId === props.pUser.id) {
                  return <Mattars item={item} props={props} key={item.id} />
                } else if (state === 'fav') {
                  if (
                    item.favorites
                      .map(function (i: any) {
                        return i.userId
                      })
                      .includes(props.pUser.id)
                  ) {
                    return <Mattars item={item} props={props} key={item.id} />
                  }
                } else if (
                  state === 'remattars' &&
                  item.userId === props.pUser.id
                ) {
                  if (item.isRemattar) {
                    return <Mattars item={item} props={props} key={item.id} />
                  }
                }
              })}
              <UserFollowing state={state.toString()} props={props} />
              <UserFollower state={state.toString()} props={props} />
            </div>
          </div>
        </div>
        <div className="col-span-3 lg:col-span-1 py-4">
          {session && (
            <div>
              <Link href={`/${props.pUser.id}`}>
                <div className="px-3 flex gap-3 items-center">
                  <div className="mt-2 w-16 h-16 relative">
                    <Image
                      src={props.pUser.profile_picture || '/img/default.png'}
                      alt="profile"
                      fill={true}
                      className="object-cover shrink-0"
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
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const qUser = ctx.query.user
  const session = await getSession(ctx)
  if (session && session.user) {
    const mattars = JSON.parse(
      JSON.stringify(
        await prisma.mattar.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
                admin: true,
                moderator: true,
              },
            },
            favorites: true,
            attaches: true,
          },
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
            following: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
                admin: true,
                moderator: true,
              },
            },
            apiCredentials: true,
          },
        })
      )
    )
    const pUser = JSON.parse(
      JSON.stringify(
        await prisma.user.findUnique({
          where: {
            id: qUser?.toString(),
          },
          include: {
            follower: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
                admin: true,
                moderator: true,
              },
            },
            following: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
                admin: true,
                moderator: true,
              },
            },
          },
        })
      )
    )
    if (!pUser) {
      return {
        notFound: true,
      }
    }
    delete user.hash
    delete user.salt
    delete user.verifyToken
    delete pUser.hash
    delete pUser.salt
    delete pUser.verifyToken
    delete pUser.twofactor
    return {
      props: {
        user,
        pUser,
        mattars: mattars.map((mattar: any) => {
          delete mattar.ip
          return mattar
        }),
      },
    }
  } else {
    const mattars = JSON.parse(
      JSON.stringify(
        await prisma.mattar.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
                admin: true,
                moderator: true,
              },
            },
            favorites: true,
            attaches: true,
          },
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
            id: qUser?.toString(),
          },
          include: {
            follower: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
                admin: true,
                moderator: true,
              },
            },
            following: {
              select: {
                id: true,
                name: true,
                profile_picture: true,
                admin: true,
                moderator: true,
              },
            },
          },
        })
      )
    )
    if (!pUser) {
      return {
        notFound: true,
      }
    }
    delete pUser.hash
    delete pUser.salt
    delete pUser.verifyToken
    return {
      props: {
        mattars: mattars.map((mattar: any) => {
          delete mattar.ip
          return mattar
        }),
        pUser,
      },
    }
  }
}

export default Profile
