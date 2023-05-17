import { Prisma } from '@prisma/client'
import { FollowUser } from '../index/FollowUser'

type MattarWithFav = Prisma.MattarGetPayload<{
  include: {
    user: true
    favorites: true
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
    favorites: true
  }
}>

type Props = {
  mattars: MattarWithFav[]
  user?: UserWithToken | undefined
  pUser: UserWithToken
}

export const UserFollowing = ({
  state,
  props,
}: {
  state: string
  props: Props
}) => {
  return (
    <>
      {state === 'following' &&
        props.pUser.following.map((item) => {
          return <FollowUser key={item.id} user={item} current={props.user} />
        })}
    </>
  )
}
