import Head from 'next/head'
import Link from 'next/link'
import Footer from 'components/Footer'
import Button from 'components/Button'
import {
  BsSearch,
  BsThreeDots,
  BsLink,
  BsStar,
  BsReply,
  BsStarFill,
  BsTrash,
} from 'react-icons/bs'
import { useState } from 'react'
import type { GetServerSideProps } from 'next'
import prisma from 'lib/prisma'
import type { Mattar, Prisma } from '@prisma/client'
import Twemoji from 'react-twemoji'
import Linkify from 'linkify-react'
import 'linkify-plugin-mention'
import 'linkify-plugin-hashtag'
import Image from 'next/image'
import { useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { enUS, ja } from 'date-fns/locale'
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
  mattar: MattarWithFav
  user: UserWithToken | undefined
}

const Mattar = (props: Props) => {
  const [faved, setFaved] = useState(
    props.user?.favorites
      .map(function (i: any) {
        return i.mattarId
      })
      .includes(props.mattar.id)
  )
  const [searchText, setSearchText] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const { user, id } = router.query
  const refreshData = () => {
    router.replace(router.asPath)
  }
  const deleteMattar = async (id: string) => {
    if (props.user && props.user.apiCredentials) {
      await fetch(
        `/api/statuses/destroy/${id}?api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
        {
          method: 'POST',
        }
      )
      refreshData()
    }
  }
  const reMattar = async (id: string) => {
    if (props.user && props.user.apiCredentials) {
      const res = await fetch(
        `/api/statuses/remattar?user_id=${props.user.id}&mattar_id=${id}&source=Mattar Web Client&api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
        {
          method: 'POST',
        }
      )
    }
  }
  const favMattar = async (id: string) => {
    if (props.user && props.user.apiCredentials) {
      setFaved(!faved)
      if (!faved) {
        await fetch(
          `/api/favorites/create?user_id=${props.user.id}&mattar_id=${id}&api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
          {
            method: 'POST',
          }
        )
      } else {
        await fetch(
          `/api/favorites/destroy?user_id=${props.user.id}&mattar_id=${id}&api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
          {
            method: 'POST',
          }
        )
      }
      refreshData()
    }
  }
  const linkifyOptions = {
    className: function (_href: string, type: string) {
      return 'text-sky-500'
    },
    formatHref: {
      mention: (href: string) => href,
      hashtag: (href: string) => 'search?query=' + href.substring(1),
    },
    target: {
      url: '_blank',
    },
    nl2br: true,
    defaultProtocol: 'https',
  }
  return (
    <Layout>
      <Head>
        <title>{`${props.mattar.user.name} on mattar.li: ${props.mattar.message} / mattar.li`}</title>
      </Head>
      <main className="px-4 mx-auto max-w-6xl grid grid-cols-3 gap-6">
        <div className="col-span-2 py-4">
          <div className="my-2">
            <div className="text-2xl">
              <Linkify options={linkifyOptions}>
                <Twemoji>{props.mattar.message}</Twemoji>
              </Linkify>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex flex-row justify-between">
              <span>
                {format(
                  new Date(props.mattar.createdAt),
                  'aahh:mm yyyy年MM月dd日',
                  { locale: ja }
                )}{' '}
                {props.mattar.source} から
              </span>
              {session && (
                <div>
                  <span>
                    <button
                      className={`duration-200 ${
                        faved ? 'text-orange-400' : 'hover:text-orange-400'
                      }`}
                      onClick={() => favMattar(props.mattar.id)}
                    >
                      {faved ? (
                        <BsStarFill className="inline-block mb-1" />
                      ) : (
                        <BsStar className="inline-block mb-1" />
                      )}
                      お気に入り
                    </button>
                  </span>
                  {!props.mattar.isRemattar && (
                    <span className="ml-2">
                      <button
                        className="duration-200 hover:text-green-400"
                        onClick={() => reMattar(props.mattar.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          fill="currentColor"
                          className="inline-block mb-1"
                          viewBox="0 0 16 16"
                        >
                          <path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192Zm3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z" />
                        </svg>
                        リツイート
                      </button>
                    </span>
                  )}
                  {/*!props.mattar.isRemattar && (
                    <span className="ml-2">
                      <button className="duration-200 hover:text-sky-400">
                        <BsReply className="inline-block mb-1" size={15} />
                        返信
                      </button>
                    </span>
                  )*/}
                  <span className="ml-2">
                    <button
                      className="duration-200 hover:text-sky-400"
                      onClick={() => {
                        toast.success('URLをコピーしました！')
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_BASE_URL}/${user}/status/${id}`
                        )
                      }}
                    >
                      <BsLink className="inline-block mb-1" size={15} />
                      コピー
                    </button>
                  </span>
                  {user === props.user?.id && (
                    <span className="ml-2">
                      <button
                        className="duration-200 hover:text-red-500"
                        onClick={() => deleteMattar(id?.toString() || '')}
                      >
                        <BsTrash className="inline-block mb-0.5" size={15} />
                        削除
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
            <hr className="my-3" />
            <div>
              <img
                src={props.mattar.user.profile_picture || ''}
                className="w-14 float-left mr-5"
              />
              <Link
                href={`/${props.mattar.userId}`}
                className="text-2xl text-sky-500"
              >
                {props.mattar.userId}
              </Link>
              <div>{props.mattar.user.name}</div>
            </div>
          </div>
        </div>
        <div className="col-span-1 py-4">
          {session && (
            <div>
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
              <table className="my-3 border-separate border-spacing-x-2.5">
                <tbody>
                  <tr>
                    <td>
                      <Link href="/?page=following">
                        <p className="font-bold">
                          {props.user?.following
                            ? props.user.following.length
                            : '0'}
                        </p>
                        <p>フォロー中</p>
                      </Link>
                    </td>
                    <td>
                      <Link href="/?page=follower">
                        <p className="font-bold">
                          {props.user?.follower
                            ? props.user.follower.length
                            : '0'}
                        </p>
                        <p>フォロワー</p>
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex flex-col">
                <Link
                  href="/"
                  className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500"
                >
                  ホーム
                </Link>
                <Link
                  href="/?page=at"
                  className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500"
                >
                  @{props.user?.id}
                </Link>
                <Link
                  href="/?page=fav"
                  className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500"
                >
                  お気に入り
                </Link>
                <Link
                  href="/?page=remattars"
                  className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500"
                >
                  リツイート
                </Link>
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const qUser = ctx.query.user
  const id = ctx.query.id
  const session = await getSession(ctx)
  if (session && session.user) {
    const mattar = JSON.parse(
      JSON.stringify(
        await prisma.mattar.findUnique({
          where: {
            id: id?.toString(),
          },
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
            attaches: true,
            favorites: true,
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
            apiCredentials: true,
          },
        })
      )
    )
    if (mattar.userId !== qUser) {
      return {
        notFound: true,
      }
    }
    delete user.hash
    delete user.salt
    delete user.verifyToken
    return {
      props: {
        user,
        mattar,
      },
    }
  } else {
    const mattar = JSON.parse(
      JSON.stringify(
        await prisma.mattar.findUnique({
          where: {
            id: id?.toString(),
          },
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
            attaches: true,
            favorites: true,
          },
        })
      )
    )
    if (mattar.userId !== qUser) {
      return {
        notFound: true,
      }
    }
    return {
      props: {
        mattar,
      },
    }
  }
}

export default Mattar
