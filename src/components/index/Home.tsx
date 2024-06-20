import { Prisma, Remattar } from '@prisma/client'
import Mattars from 'components/Mattar'

type MattarWithFav = Prisma.MattarGetPayload<{
  include: {
    user: true
    favorites: true
    attaches: true
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

type RemattarWithMattar = Prisma.RemattarGetPayload<{
  include: {
    mattar: {
      include: {
        user: true
        favorites: true
        attaches: true
      }
    }
    user: true
  }
}>

type Props = {
  mattars: MattarWithFav[] | RemattarWithMattar[]
  user: UserWithToken | undefined
}

export const IndexHome = ({
  state,
  props,
}: {
  state: string
  props: Props
}) => {
  return (
    <>
      {props.mattars.map((item) => {
        if ('message' in item) {
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
          }
        } else if ('mattarId' in item) {
          if (item.userId === props.user?.id) {
            return (
              <Mattars
                item={item.mattar}
                props={props}
                key={item.id}
                remattar={{
                  id: item.id,
                  user: {
                    id: item.user.id,
                    name: item.user.name,
                  },
                }}
              />
            )
          }
        }
      })}
    </>
  )
}
