import Head from 'next/head'
import Link from 'next/link'
import Footer from 'components/Footer'
import Button from 'components/Button'
import { BsSearch } from 'react-icons/bs'
import { useState, Fragment } from 'react'
import twemoji from 'twemoji'
import type { GetServerSideProps } from 'next'
import prisma from 'lib/prisma'
import type { Prisma } from '@prisma/client'
import { useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import QRCode from 'react-qr-code'
import { useForm, SubmitHandler } from 'react-hook-form'
import Image from 'next/image'
import { authenticator } from 'otplib'
import { Dialog, Transition } from '@headlessui/react'
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
  }
}>

type Props = {
  user: UserWithToken
}

type InfoInputs = {
  email: string
  bday: string
  lang: string
}

type SecurityInputs = {
  oldPassword: string
  newPassword: string
  reNewPassword: string
  twoFactor: string
}

const Settings = (props: Props) => {
  const { data: session } = useSession()
  const router = useRouter()
  const page = router.query.page || 'info'
  const [state, setState] = useState(page)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InfoInputs>()

  const {
    register: sregister,
    handleSubmit: shandleSubmit,
    getValues,
    formState: { errors: serrors },
  } = useForm<SecurityInputs>()

  const refreshData = () => {
    router.replace(router.asPath)
  }

  const setPage = (name: string) => {
    setState(name)
    router.query.page = name
    router.push(router)
  }

  const onInfoSubmit: SubmitHandler<InfoInputs> = async (data) => {
    if (props.user && props.user.apiCredentials) {
      const wait = toast.loading('更新中です...')
      const res = await fetch(
        `/api/account/update_profile?api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
        {
          body: JSON.stringify({
            id: props.user.id,
            email: data.email,
            birthday: data.bday,
            lang: data.lang,
            verified: props.user.email !== data.email,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      )
      const { error } = await res.json()
      if (error) {
        toast.error(error, {
          id: wait,
        })
        return
      }
      if (props.user.email !== data.email) {
        const issue = await fetch(
          `/api/account/verify/issue?user_id=${props.user.id}`
        )
        const mailres = await issue.json()
        if (mailres.error) {
          toast.error(mailres.error, {
            id: wait,
          })
          return
        }
      }
      toast.success('ユーザー情報を更新しました！', {
        id: wait,
      })
      refreshData()
    }
  }

  const secret = authenticator.generateSecret()
  const otpauth = authenticator.keyuri(props.user.email, 'mattar.li', secret)

  const onSecuritySubmit: SubmitHandler<SecurityInputs> = async (data) => {
    const wait = toast.loading('更新中です...')
    const res = await fetch('/api/account/settings', {
      body: JSON.stringify({
        id: props.user.id,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        twoFactorSecret: secret,
        twoFactor: data.twoFactor,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const { error } = await res.json()
    if (error) {
      console.log(error)
      toast.error(error, {
        id: wait,
      })
      return
    }
    toast.success('セキュリティ情報を更新しました！', {
      id: wait,
    })
    refreshData()
  }

  const resetTwoFactor = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const res = await fetch('/api/account/settings', {
      body: JSON.stringify({
        id: props.user.id,
        twoFactor: 'reset',
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
    refreshData()
  }

  const issueToken = async () => {
    const wait = toast.loading('メールを送信中です...')
    const res = await fetch(
      `/api/account/verify/issue?user_id=${props.user.id}`
    )
    const { error } = await res.json()
    if (error) {
      console.log(error)
      toast.error(error, {
        id: wait,
      })
      return
    }
    toast.success('メールを送信しました！', {
      id: wait,
    })
  }

  const issueAPI = async () => {
    const wait = toast.loading('APIトークンを作成中です...')
    const res = await fetch(`/api/developer/issue?user_id=${props.user.id}`)
    const { error } = await res.json()
    if (error) {
      console.log(error)
      toast.error(error, {
        id: wait,
      })
      return
    }
    toast.success('APIトークンを作成しました！', {
      id: wait,
    })
    refreshData()
  }

  const deleteAccount = async () => {
    const wait = toast.loading('アカウントを削除中です...')
    const res = await fetch(`/api/account/destroy/${props.user.id}`)
    const { error } = await res.json()
    if (error) {
      toast.error(error, {
        id: wait,
      })
      console.log(error)
    }
    toast.success('アカウントを削除しました', {
      id: wait,
    })
    setDeleteOpen(false)
  }
  if (session) {
    return (
      <Layout>
        <Head>
          <title>アカウント / mattar.li</title>
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
        <main className="px-4 mx-auto max-w-6xl grid grid-cols-3 gap-6">
          <div className="col-span-3 lg:col-span-2 py-4">
            <div className="my-6">
              <h1 className="font-bold text-3xl">
                {state === 'info' && '一般'}
                {state === 'security' && 'セキュリティ'}
                {state === 'dev' && '開発者向け'}
              </h1>
              {state === 'info' && (
                <div className="my-6">
                  {!props.user.verified && (
                    <p className="text-red-500 font-bold mb-3">
                      メールアドレスが認証されていません。メールをご確認ください。
                      <span>
                        <button
                          onClick={issueToken}
                          className="text-sky-500 duration-200 hover:text-sky-700"
                        >
                          メールを再送
                        </button>
                      </span>
                    </p>
                  )}
                  <form
                    key={1}
                    onSubmit={handleSubmit(onInfoSubmit)}
                    className="mb-3"
                  >
                    <div className="flex flex-col mb-4">
                      <label htmlFor="email">メールアドレス</label>
                      <input
                        id="email"
                        type="text"
                        defaultValue={props.user.email}
                        {...register('email', { required: true })}
                        className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      />
                    </div>
                    <div className="flex flex-col mb-4">
                      <label htmlFor="bday">生年月日</label>
                      <input
                        id="bday"
                        type="date"
                        pattern="\d{4}-\d{2}-\d{2}"
                        defaultValue={props.user.birthday || ''}
                        {...register('bday')}
                        className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      />
                    </div>
                    <div className="flex flex-col mb-4">
                      <label htmlFor="lang">言語</label>
                      <select
                        defaultValue={props.user.lang || ''}
                        {...register('lang', { required: true })}
                        className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      >
                        <option value="ja_JP">日本語</option>
                        <option value="en_US">English (US)</option>
                      </select>
                    </div>
                    <input
                      type="submit"
                      value="更新"
                      className="cursor-pointer px-4 text-white py-2 rounded-md bg-primary shadow-md duration-200 hover:shadow-sm"
                    />
                  </form>
                  <a
                    href={`/api/account/archive/${props.user.id}`}
                    className="px-4 text-white py-2 rounded-md bg-red-600 shadow-md duration-200 hover:shadow-sm"
                  >
                    データをダウンロード
                  </a>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="ml-4 px-4 text-white py-2 rounded-md bg-red-600 shadow-md duration-200 hover:shadow-sm"
                  >
                    アカウントを削除
                  </button>
                  <Transition appear show={deleteOpen} as={Fragment}>
                    <Dialog
                      as="div"
                      className="relative z-10"
                      onClose={() => setDeleteOpen(false)}
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
                                className="text-lg font-medium leading-6"
                              >
                                本当にアカウントを削除しますか？
                              </Dialog.Title>
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                  アカウントを削除すると、投稿などのアカウントに関するデータは削除され、復元できません。
                                </p>
                              </div>

                              <div className="mt-4 text-right">
                                <button
                                  type="button"
                                  className="mr-2 bg-primary shadow-md rounded-md text-white px-4 py-2 duration-200 hover:shadow-sm"
                                  onClick={() => setDeleteOpen(false)}
                                >
                                  キャンセル
                                </button>
                                <button
                                  type="button"
                                  className="bg-red-600 shadow-md rounded-md text-white px-4 py-2 duration-200 hover:shadow-sm"
                                  onClick={() => deleteAccount()}
                                >
                                  OK
                                </button>
                              </div>
                            </Dialog.Panel>
                          </Transition.Child>
                        </div>
                      </div>
                    </Dialog>
                  </Transition>
                </div>
              )}
              {state === 'security' && (
                <div className="my-6">
                  {!props.user.verified && (
                    <p className="text-red-500 font-bold mb-3">
                      メールアドレスが認証されていません。メールをご確認ください。
                      <span>
                        <button
                          onClick={issueToken}
                          className="text-sky-500 duration-200 hover:text-sky-700"
                        >
                          メールを再送
                        </button>
                      </span>
                    </p>
                  )}
                  <form key={2} onSubmit={shandleSubmit(onSecuritySubmit)}>
                    <h2 className="text-2xl font-bold my-3">パスワード</h2>
                    <div className="flex flex-col mb-4">
                      <label htmlFor="oldPassword">現在のパスワード</label>
                      <input
                        id="oldPassword"
                        type="password"
                        {...sregister('oldPassword')}
                        className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      />
                    </div>
                    <div className="flex flex-col mb-4">
                      <label htmlFor="newPassword">新しいパスワード</label>
                      <input
                        id="newPassword"
                        type="password"
                        {...sregister('newPassword')}
                        className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      />
                    </div>
                    <div className="flex flex-col mb-4">
                      <label htmlFor="reNewPassword">
                        新しいパスワードを再入力
                      </label>
                      <input
                        id="reNewPassword"
                        type="password"
                        {...sregister('reNewPassword', {
                          validate: (value) => {
                            const { newPassword } = getValues()
                            return (
                              newPassword === value ||
                              'パスワードが合致しません'
                            )
                          },
                        })}
                        className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      />
                    </div>
                    <h2 className="text-2xl font-bold my-3">二段階認証</h2>
                    {props.user.twofactor ? (
                      <div className="mb-4">
                        <p className="mb-3">設定済み</p>
                        <Button
                          onClick={(e) => resetTwoFactor(e)}
                          className="px-4 text-white py-2 rounded-md bg-primary shadow-md duration-200 hover:shadow-sm"
                        >
                          リセット
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col mb-4">
                        <QRCode value={otpauth} className="mb-5" />
                        <input
                          id="gen"
                          type="text"
                          readOnly
                          value={secret}
                          className="mb-3 bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                        />
                        <label htmlFor="2fact">コード</label>
                        <input
                          id="2fact"
                          type="text"
                          {...sregister('twoFactor')}
                          className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                        />
                      </div>
                    )}
                    <input
                      type="submit"
                      value="更新"
                      className="cursor-pointer px-4 text-white py-2 rounded-md bg-primary shadow-md duration-200 hover:shadow-sm"
                    />
                  </form>
                </div>
              )}
              {state === 'dev' && (
                <div className="my-6">
                  {!props.user.verified && (
                    <p className="text-red-500 font-bold mb-3">
                      メールアドレスが認証されていません。メールをご確認ください。
                      <span>
                        <button
                          onClick={issueToken}
                          className="text-sky-500 duration-200 hover:text-sky-700"
                        >
                          メールを再送
                        </button>
                      </span>
                    </p>
                  )}
                  <div className="mb-3">
                    <div className="flex flex-col mb-4">
                      <label htmlFor="token">APIトークン</label>
                      <input
                        id="token"
                        type="text"
                        value={
                          props.user.verified && props.user.apiCredentials
                            ? props.user.apiCredentials.token
                            : '非表示'
                        }
                        readOnly
                        className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      />
                    </div>
                    <div className="flex flex-col mb-4">
                      <label htmlFor="secret">APIシークレット</label>
                      <input
                        id="secret"
                        type="text"
                        value={
                          props.user.verified && props.user.apiCredentials
                            ? props.user.apiCredentials.secret
                            : '非表示'
                        }
                        readOnly
                        className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      />
                    </div>
                    <button
                      onClick={issueAPI}
                      className="cursor-pointer px-4 text-white py-2 rounded-md bg-primary shadow-md duration-200 hover:shadow-sm"
                    >
                      生成
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="col-span-3 lg:col-span-1 py-4">
            <div>
              <Link href={`/${props.user?.id}`}>
                <div className="px-3 flex gap-3 items-center">
                  <div className="mt-2 w-16 h-16 relative">
                    <Image
                      src={props.user.profile_picture || '/img/default.png'}
                      fill={true}
                      alt={`${props.user.profile_picture}\'s Avatar`}
                      className="object-cover shrink-0"
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
              </Link>
              <table className="my-3 border-separate border-spacing-x-2.5">
                <tbody>
                  <tr>
                    <td>
                      <Link href="/?page=following">
                        <p className="font-bold">
                          {props.user.following
                            ? props.user.following.length
                            : '0'}
                        </p>
                        <p>フォロー中</p>
                      </Link>
                    </td>
                    <td>
                      <Link href="/?page=follower">
                        <p className="font-bold">
                          {props.user.follower
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
                <button
                  onClick={() => setPage('info')}
                  className={`text-left px-3 py-1 duration-300 ${
                    state === 'info'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-zinc-500'
                  }`}
                >
                  一般
                </button>
                <button
                  onClick={() => setPage('security')}
                  className={`text-left px-3 py-1 duration-300 ${
                    state === 'security'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-zinc-500'
                  }`}
                >
                  セキュリティ
                </button>
                <button
                  onClick={() => setPage('dev')}
                  className={`text-left px-3 py-1 duration-300 ${
                    state === 'dev'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-zinc-500'
                  }`}
                >
                  開発者向け
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
            <Footer />
          </div>
        </main>
      </Layout>
    )
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const session = await getSession(ctx)
  if (session && session.user && session.user.id) {
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
            apiCredentials: true,
          },
        })
      )
    )
    return {
      props: {
        user,
      },
    }
  } else {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    }
  }
}

export default Settings
