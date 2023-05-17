import { Prisma } from '@prisma/client'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Fragment, useState } from 'react'
import Button from 'components/Button'
import { Menu, Transition } from '@headlessui/react'
import { BsThreeDots } from 'react-icons/bs'

type User = Prisma.UserGetPayload<{
  include: {
    follower: true
    following: true
  }
}>

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
  }
}>

export const FollowUser = ({
  user,
  current,
}: {
  user: User
  current?: UserWithToken
}) => {
  const [following, setFollowing] = useState(
    current?.following
      .map(function (i: any) {
        return i.id
      })
      .includes(user.id)
  )
  const router = useRouter()
  const refreshData = () => {
    router.replace(router.asPath)
  }
  const followState = async () => {
    if (current && current.apiCredentials) {
      if (
        current.following
          .map(function (i: any) {
            return i.id
          })
          .includes(user.id)
      ) {
        const res = await fetch(
          `/api/friendships/destroy?user_id=${current.id}&unfollow_user_id=${user.id}&api_token=${current.apiCredentials.token}&api_secret=${current.apiCredentials.secret}`
        )
      } else {
        const ref = await fetch(
          `/api/friendships/create?user_id=${current.id}&follow_user_id=${user.id}&api_token=${current.apiCredentials.token}&api_secret=${current.apiCredentials.secret}`
        )
      }
      setFollowing(!following)
      refreshData()
    }
  }
  return (
    <article className="flex gap-3 group relative" key={user.id}>
      <div className="w-16 h-16 relative">
        <Image
          src={user.profile_picture || ''}
          alt={`${user.name}\'s Avatar`}
          fill={true}
          className="object-cover shrink-0"
        />
      </div>
      <Link href={`/${user.id}`}>
        <div>
          <span className="font-bold text-lg block">{user.name}</span>
          <span className="text-md">@{user.id}</span>
        </div>
      </Link>
      <div>
        {current && (
          <Button
            className="absolute top-2 right-20 bg-primary text-white px-4 py-2 shadow-md duration-200 hover:shadow-sm rounded-md"
            onClick={followState}
          >
            {following ? 'フォロー中' : 'フォロー'}
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
              {current && (
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
                          `${process.env.NEXT_PUBLIC_BASE_URL}/${user.id}`
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
}
