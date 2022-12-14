import Head from 'next/head'
import Link from 'next/link'
import Header from 'components/Header'
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
import { useState, Fragment } from 'react'
import twemoji from 'twemoji'
import type { GetServerSideProps } from 'next'
import prisma from 'lib/prisma'
import type { Mattar, User } from '@prisma/client'
import * as linkify from 'linkifyjs'
import linkifyHtml from 'linkify-html'
import 'linkify-plugin-mention'
import 'linkify-plugin-hashtag'
import { useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { enUS, ja } from 'date-fns/locale'

type Props = {
  mattar: Mattar
  user: User | undefined
}

const Mattar = (props: Props) => {
  const [searchText, setSearchText] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const { user, id } = router.query
  const refreshData = () => {
    router.replace(router.asPath)
  }
  const deleteMattar = async (id: string) => {
    await fetch(
      `/api/statuses/destroy/${id}?api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
      {
        method: 'POST',
      }
    )
    refreshData()
  }
  const reMattar = async (id: string) => {
    const res = await fetch(
      `/api/statuses/remattar?user_id=${props.user.id}&mattar_id=${id}&source=Mattar Web Client&api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
      {
        method: 'POST',
      }
    )
  }
  const favMattar = async (id: string) => {
    await fetch(
      `/api/favorites/create?user_id=${props.user.id}&mattar_id=${id}&api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
      {
        method: 'POST',
      }
    )
    refreshData()
  }
  const disfavMattar = async (id: string) => {
    await fetch(
      `/api/favorites/destroy?user_id=${props.user.id}&mattar_id=${id}&api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
      {
        method: 'POST',
      }
    )
    refreshData()
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
    <div className="dark:bg-zinc-800 dark:text-white h-screen">
      <Head>
        <title>{`${props.mattar.user.name} on mattar.li: ${props.mattar.message} / mattar.li`}</title>
        <meta
          property="og:title"
          content={`${props.mattar.user.name} on mattar.li`}
        />
        <meta property="og:description" content={`???${props.mattar.message}???`} />
        <meta name="description" content={`???${props.mattar.message}???`} />
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
        <div className="col-span-2 py-4">
          <div className="my-2">
            <div
              className="text-2xl"
              dangerouslySetInnerHTML={{
                __html: linkifyHtml(
                  twemoji.parse(props.mattar.message),
                  linkifyOptions
                ),
              }}
            ></div>
            <div className="mt-2 text-xs text-gray-500 flex flex-row justify-between">
              <span>
                {format(
                  new Date(props.mattar.createdAt),
                  'aahh:mm yyyy???MM???dd???',
                  { locale: ja }
                )}{' '}
                {props.mattar.source} ??????
              </span>
              {session && (
                <div>
                  <span>
                    <button
                      className={`duration-200 ${
                        props.user.favorites
                          .map(function (i: any) {
                            return i.mattarId
                          })
                          .includes(props.mattar.id)
                          ? 'text-orange-400'
                          : 'hover:text-orange-400'
                      }`}
                      onClick={() => {
                        if (
                          props.user.favorites
                            .map(function (i: any) {
                              return i.mattarId
                            })
                            .includes(props.mattar.id)
                        ) {
                          disfavMattar(props.mattar.id)
                        } else {
                          favMattar(props.mattar.id)
                        }
                      }}
                    >
                      {props.user.favorites
                        .map(function (i: any) {
                          return i.mattarId
                        })
                        .includes(props.mattar.id) ? (
                        <BsStarFill className="inline-block mb-1" />
                      ) : (
                        <BsStar className="inline-block mb-1" />
                      )}
                      ???????????????
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
                        ???????????????
                      </button>
                    </span>
                  )}
                  {/*!props.mattar.isRemattar && (
                    <span className="ml-2">
                      <button className="duration-200 hover:text-sky-400">
                        <BsReply className="inline-block mb-1" size={15} />
                        ??????
                      </button>
                    </span>
                  )*/}
                  <span className="ml-2">
                    <button
                      className="duration-200 hover:text-sky-400"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${process.env.NEXT_PUBLIC_BASE_URL}/${user}/status/${id}`
                        )
                      }
                    >
                      <BsLink className="inline-block mb-1" size={15} />
                      ?????????
                    </button>
                  </span>
                  {user === props.user.id && (
                    <span className="ml-2">
                      <button
                        className="duration-200 hover:text-red-500"
                        onClick={() => deleteMattar(id)}
                      >
                        <BsTrash className="inline-block mb-0.5" size={15} />
                        ??????
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
            <hr className="my-3" />
            <div>
              <img
                src={props.mattar.user.profile_picture}
                className="w-14 float-left mr-5"
              />
              <Link href={`/${props.mattar.userId}`}>
                <a className="text-2xl text-sky-500">{props.mattar.userId}</a>
              </Link>
              <div>{props.mattar.user.name}</div>
            </div>
          </div>
        </div>
        <div className="col-span-1 py-4">
          {session && (
            <div>
              <div className="px-3 flex gap-3 items-center">
                <img src={props.mattar.user.profile_picture} className="w-12" />
                <div>
                  <p className="font-bold">{props.user.name}</p>
                  <p>
                    {props.user.mattar_count}
                    ???????????????
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
                            {props.user.following
                              ? props.user.following.length
                              : '0'}
                          </p>
                          <p>???????????????</p>
                        </a>
                      </Link>
                    </td>
                    <td>
                      <Link href="/?page=follower">
                        <a>
                          <p className="font-bold">
                            {props.user.follower
                              ? props.user.follower.length
                              : '0'}
                          </p>
                          <p>???????????????</p>
                        </a>
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex flex-col">
                <Link href="/">
                  <a className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500">
                    ?????????
                  </a>
                </Link>
                <Link href="/?page=at">
                  <a className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500">
                    @{props.user.id}
                  </a>
                </Link>
                <Link href="/msg">
                  <a className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500">
                    ???????????????
                  </a>
                </Link>
                <Link href="/fav">
                  <a className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500">
                    ???????????????
                  </a>
                </Link>
                <Link href="/rtw">
                  <a className="px-3 py-1 duration-300 hover:bg-gray-200 dark:hover:bg-zinc-500">
                    ???????????????
                  </a>
                </Link>
              </div>
              <div className="my-4 px-3 flex">
                <input
                  placeholder="??????"
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
  const id = ctx.query.id
  const session = await getSession(ctx)
  if (session && session.user) {
    const mattar = JSON.parse(
      JSON.stringify(
        await prisma.mattar.findUnique({
          where: {
            id: id,
          },
          include: { user: true },
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
            id: id,
          },
          include: { user: true },
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
