import { Menu, Transition } from '@headlessui/react'
import Image from 'next/image'
import { BsThreeDots, BsStar, BsStarFill } from 'react-icons/bs'
import { Fragment, useState } from 'react'
import Twemoji from 'react-twemoji'
import Linkify from 'linkify-react'
import 'linkify-plugin-mention'
import 'linkify-plugin-hashtag'
import { useRouter } from 'next/router'
import { Mattar, Prisma } from 'lib/prisma'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ImageGallery } from './mattar/ImageGallery'

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
  mattars: Mattar[]
  user?: UserWithToken | undefined
}

interface MattarProps {
  item: MattarWithFav
  props: Props
  key: string
}

const Mattars: React.FC<MattarProps> = ({ item, props }) => {
  const router = useRouter()
  const [faved, setFaved] = useState(
    props.user?.favorites
      .map(function (i: any) {
        return i.mattarId
      })
      .includes(item.id)
  )
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
      return 'text-sky-500 duration-200 hover:text-sky-600'
    },
    formatHref: {
      hashtag: (href: string) => 'search?query=' + href.substring(1),
      mention: (href: string) => href,
    },
    format: (value: string, type: string) => {
      if (/^https?:\/\//.test(value)) {
        value = value.replace(/^https?:\/\//, '')
      }
      if (type === 'url' && value.length > 28) {
        value = value.slice(0, 28) + '...'
      }
      return value
    },
    target: {
      url: '_blank',
    },
    nl2br: true,
    defaultProtocol: 'https',
  }
  const reMattar = async (id: string) => {
    if (props.user && props.user.apiCredentials) {
      const res = await fetch(
        `/api/statuses/remattar?user_id=${props.user?.id}&mattar_id=${id}&source=Mattar Web Client&api_token=${props.user?.apiCredentials?.token}&api_secret=${props.user?.apiCredentials?.secret}`,
        {
          method: 'POST',
        }
      )
      refreshData()
    }
  }
  const favMattar = async (id: string) => {
    setFaved(!faved)
    if (props.user && props.user.apiCredentials) {
      if (
        props.user?.favorites
          .map(function (i: any) {
            return i.mattarId
          })
          .includes(item.id)
      ) {
        await fetch(
          `/api/favorites/destroy?user_id=${props.user?.id}&mattar_id=${id}&api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
          {
            method: 'POST',
          }
        )
      } else {
        await fetch(
          `/api/favorites/create?user_id=${props.user?.id}&mattar_id=${id}&api_token=${props.user?.apiCredentials?.token}&api_secret=${props.user?.apiCredentials?.secret}`,
          {
            method: 'POST',
          }
        )
      }
    }
  }
  const deleteMattar = async (id: string) => {
    if (props.user && props.user.apiCredentials) {
      const load = toast.loading('削除中です...')
      const res = await (
        await fetch(
          `/api/statuses/destroy/${id}?api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
          {
            method: 'POST',
          }
        )
      ).json()
      if (res.error) {
        toast.error(res.error, {
          id: load,
        })
      } else {
        toast.success('削除しました！', {
          id: load,
        })
      }
      refreshData()
    }
  }
  const reportMattar = async (id: string) => {
    if (props.user && props.user.apiCredentials) {
      const load = toast.loading('通報しています...')
      const res = await (
        await fetch(
          `/api/statuses/destroy/${id}?api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
          {
            method: 'POST',
          }
        )
      ).json()
      if (res.error) {
        toast.error(res.error, {
          id: load,
        })
      } else {
        toast.success('削除しました！', {
          id: load,
        })
      }
      refreshData()
    }
  }

  const youtubeReg =
    /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
  const niconicoReg =
    /http(?:s?):\/\/(?:www\.)?nico(?:video\.jp\/watch|\.ms)\/(sm[A-Za-z0-9]+)/
  const bilibiliReg =
    /http(?:s?):\/\/(?:www\.bilibili\.com\/video|b23\.tv)\/(BV[A-Za-z0-9]+)/
  const spotifyReg = /http(?:s?):\/\/open.spotify.com\/track\/([a-zA-Z0-9]+)/
  const videoReg = new RegExp(
    youtubeReg.source +
      '|' +
      niconicoReg.source +
      '|' +
      bilibiliReg.source +
      '|' +
      spotifyReg.source,
    'g'
  )

  let embed

  if (videoReg.test(item.message)) {
    const matches = item.message.match(videoReg)
    if (matches && matches[matches?.length - 1]) {
      const embedUrl = matches[matches?.length - 1]
      if (youtubeReg.test(embedUrl)) {
        const embedId = embedUrl.match(youtubeReg) || ''
        embed = (
          <iframe
            src={`https://www.youtube.com/embed/${embedId[1]}`}
            className="block w-full aspect-video my-3"
            title="YouTube video player"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        )
      } else if (niconicoReg.test(embedUrl)) {
        const embedId = embedUrl.match(niconicoReg) || ''
        embed = (
          <iframe
            allowFullScreen
            allow="autoplay"
            className="block w-full aspect-video my-3"
            loading="lazy"
            src={`https://embed.nicovideo.jp/watch/${embedId[1]}?persistence=1&amp;from=0&amp;allowProgrammaticFullScreen=1`}
          ></iframe>
        )
      } else if (bilibiliReg.test(embedUrl)) {
        const embedId = embedUrl.match(bilibiliReg) || ''
        embed = (
          <iframe
            src={`//player.bilibili.com/player.html?bvid=${embedId[1]}&page=1`}
            className="block w-full aspect-video my-3"
            loading="lazy"
            allowFullScreen
          ></iframe>
        )
      } else {
        const embedId = embedUrl.match(spotifyReg) || ''
        embed = (
          <iframe
            src={`https://open.spotify.com/embed/track/${embedId[1]}?utm_source=generator`}
            width="100%"
            height="152"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="block w-full rounded-md my-3"
          ></iframe>
        )
      }
    }
  }

  return (
    <article className="relative flex gap-3 group">
      <Link href={`/${item.user.id}`}>
        <div className="mt-2 w-14 h-14 relative">
          <Image
            src={item.user.profile_picture || '/img/default.png'}
            alt={`${item.user.id}\'s Avatar`}
            fill={true}
            className="shrink-0 object-cover"
          />
        </div>
      </Link>
      <div className="w-full">
        <Link href={`/${item.user.id}`}>
          <span className="font-bold">{item.user.name}</span>
        </Link>
        <Linkify options={linkifyOptions}>
          <Twemoji>{item.message}</Twemoji>
        </Linkify>
        {item.attaches.length !== 0 && <ImageGallery files={item.attaches} />}
        {item.attaches.length === 0 && embed}
        <div className="text-xs text-gray-400">
          <span title={item.createdAt.toString()}>
            {getElapsedTime(item.createdAt)}
          </span>
          {props.user && (
            <span
              className={`ml-3 duration-200 ${
                !faved && 'lg:opacity-0 lg:group-hover:opacity-100'
              }`}
            >
              <button
                className={`duration-200 ${
                  faved ? 'text-orange-400' : 'hover:text-orange-400'
                }`}
                onClick={() => favMattar(item.id)}
              >
                {faved ? (
                  <BsStarFill className="inline-block mb-1" />
                ) : (
                  <BsStar className="inline-block mb-1" />
                )}
                <span className="hidden md:inline-block">お気に入り</span>
              </button>
            </span>
          )}
          {props.user && !item.isRemattar && (
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
                <span className="hidden md:inline-block">リツイート</span>
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
            {props.user && props.user.id !== item.user.id && (
              <Menu.Item>
                <button
                  className="duration-200 px-4 py-2 text-left bg-white hover:bg-gray-200 hover:dark:bg-zinc-600 dark:bg-zinc-800"
                  onClick={() => reportMattar(item.id)}
                >
                  通報
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
