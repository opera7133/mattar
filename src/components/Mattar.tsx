import { Menu, Transition } from '@headlessui/react'
import Image from 'next/image'
import twemoji from 'twemoji'
import { BsThreeDots, BsStar, BsStarFill } from 'react-icons/bs'
import { Fragment } from 'react'
import * as linkify from 'linkifyjs'
import linkifyHtml from 'linkify-html'
import 'linkify-plugin-mention'
import 'linkify-plugin-hashtag'
import { useRouter } from 'next/router'
import { Mattar } from 'lib/prisma'
import Link from 'next/link'

interface Props {
  item: any
  props: any
  key: string
}

const Mattars: React.FC<Props> = ({ item, props }) => {
  const router = useRouter()
  const refreshData = () => {
    router.replace(router.asPath)
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
  const reMattar = async (id: string) => {
    const res = await fetch(
      `/api/statuses/remattar?user_id=${props.user?.id}&mattar_id=${id}&source=Mattar Web Client`,
      {
        method: 'POST',
      }
    )
    refreshData()
  }
  const favMattar = async (id: string) => {
    await fetch(
      `/api/favorites/create?user_id=${props.user?.id}&mattar_id=${id}`,
      {
        method: 'POST',
      }
    )
    refreshData()
  }
  const disfavMattar = async (id: string) => {
    await fetch(
      `/api/favorites/destroy?user_id=${props.user?.id}&mattar_id=${id}`,
      {
        method: 'POST',
      }
    )
    refreshData()
  }
  const deleteMattar = async (id: string) => {
    await fetch('/api/statuses/destroy/' + id, {
      method: 'POST',
    })
    refreshData()
  }
  return (
    <article className="relative flex gap-3 group">
      <Link href={`/${item.user.id}`}>
        <a>
          <div className="mt-2 w-14 h-14 relative">
            <Image
              src={item.user.profile_picture || '/img/default.png'}
              alt={`${item.user.id}\'s Avatar`}
              layout="fill"
              objectFit="cover"
              className="shrink-0"
            />
          </div>
        </a>
      </Link>
      <div>
        <Link href={`/${item.user.id}`}>
          <a>
            <span className="font-bold">{item.user.name}</span>
          </a>
        </Link>
        <div
          dangerouslySetInnerHTML={{
            __html: linkifyHtml(twemoji.parse(item.message), linkifyOptions),
          }}
        ></div>
        <div className="text-xs text-gray-400">
          <span title={item.createdAt.toString()}>
            {getElapsedTime(item.createdAt)}
          </span>
          <span
            className={`ml-3 duration-200 ${
              !props.user.favorites
                .map(function (i: any) {
                  return i.mattarId
                })
                .includes(item.id) && 'lg:opacity-0 lg:group-hover:opacity-100'
            }`}
          >
            <button
              className={`duration-200 ${
                props.user.favorites
                  .map(function (i: any) {
                    return i.mattarId
                  })
                  .includes(item.id)
                  ? 'text-orange-400'
                  : 'hover:text-orange-400'
              }`}
              onClick={() => {
                if (
                  props.user.favorites
                    .map(function (i: any) {
                      return i.mattarId
                    })
                    .includes(item.id)
                ) {
                  disfavMattar(item.id)
                } else {
                  favMattar(item.id)
                }
              }}
            >
              {props.user.favorites
                .map(function (i: any) {
                  return i.mattarId
                })
                .includes(item.id) ? (
                <BsStarFill className="inline-block mb-1" />
              ) : (
                <BsStar className="inline-block mb-1" />
              )}
              お気に入り
            </button>
          </span>
          {!item.isRemattar && (
            <span className="ml-2 duration-200 lg:opacity-0 lg:group-hover:opacity-100">
              <button
                className="duration-200 hover:text-green-400"
                onClick={() => reMattar(item.id)}
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
          {/*!item.isRemattar && (
            <span className="ml-2 duration-200 lg:opacity-0 lg:group-hover:opacity-100">
              <button className="duration-200 hover:text-sky-400">
                <BsReply
                  className="inline-block mb-1"
                  size={15}
                />
                返信
              </button>
            </span>
          )*/}
        </div>
      </div>
      <Menu>
        <Menu.Button>
          <BsThreeDots className="absolute z-0 right-0 top-2 opacity-80 lg:opacity-0 duration-200 lg:group-hover:opacity-80" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="text-sm z-10 shadow-md absolute right-0 top-7 flex flex-col">
            <Menu.Item>
              <button
                className="duration-200 px-4 py-2 text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${window.location.protocol}://${
                      window.location.hostname === 'localhost'
                        ? 'localhost:3000'
                        : window.location.hostname
                    }/${item.userId}/status/${item.id}`
                  )
                }
              >
                リンクをコピー
              </button>
            </Menu.Item>
            {props.user?.id === item.user.id && (
              <Menu.Item>
                <button
                  className="duration-200 px-4 py-2 text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800"
                  onClick={() => deleteMattar(item.id)}
                >
                  削除
                </button>
              </Menu.Item>
            )}
          </Menu.Items>
        </Transition>
      </Menu>
    </article>
  )
}
export default Mattars
