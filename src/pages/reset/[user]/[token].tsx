import type { GetServerSideProps } from 'next/types'
import { jwtVerify } from 'jose'
import { Layout } from 'components/Layout'
import Head from 'next/head'
import Footer from 'components/Footer'
import Button from 'components/Button'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { PWStrength } from 'components/PWStrength'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'

const VerifiedResetPassword = ({
  token,
  user,
}: {
  token: string
  user: string
}) => {
  type Inputs = {
    password: string
    password_confirm: string
  }

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm<Inputs>()

  const router = useRouter()
  const watchPassword = watch('password', '')

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const wait = toast.loading('更新中です...')
    const res = await (
      await fetch('/api/account/reset_password', {
        method: 'POST',
        body: JSON.stringify({ password: data.password, token: token }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ).json()
    if (res.error) {
      toast.error(res.error, {
        id: wait,
      })
    } else {
      toast.success('パスワードを更新しました！', {
        id: wait,
      })
      signOut()
      router.push('/signin')
    }
  }

  const classNames = (...classes: any[]) => {
    return classes.filter(Boolean).join(' ')
  }
  return (
    <Layout>
      <Head>
        <title>パスワードをリセット / mattar.li</title>
      </Head>
      <article className="pt-10 mb-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
        <h1 className="text-2xl font-bold mb-3">パスワードをリセット</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-w-xl flex flex-col gap-3 my-5">
            <div className="inline-flex flex-col">
              <label className="text-lg" htmlFor="userid">
                ユーザー名
              </label>
              <input
                className="bg-gray-200 border-none rounded-md text-lg px-5 py-3 duration-200 text-gray-600"
                type="text"
                id="userid"
                value={user}
                disabled
              />
            </div>
            <div className="inline-flex flex-col">
              <label className="text-lg" htmlFor="password">
                新しいパスワード
              </label>
              <input
                className={classNames(
                  errors.password ? 'bg-red-200' : '',
                  'bg-gray-200 border-none rounded-md text-lg px-5 py-3 duration-200 text-black focus:ring-0 focus:bg-gray-100'
                )}
                type="password"
                {...register('password', {
                  required: true,
                  minLength: {
                    value: 8,
                    message: '8文字以上',
                  },
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  onBlur: () => {
                    if (getValues('password_confirm')) {
                      trigger('password_confirm')
                    }
                  },
                })}
                id="password"
              />
              <PWStrength password={watchPassword} />
            </div>
            <div className="inline-flex flex-col">
              <label className="text-lg" htmlFor="password_confirm">
                新しいパスワード（再入力）
              </label>
              <input
                className={classNames(
                  errors.password ? 'bg-red-200' : '',
                  'bg-gray-200 border-none rounded-md text-lg px-5 py-3 duration-200 text-black focus:ring-0 focus:bg-gray-100'
                )}
                type="password"
                {...register('password_confirm', {
                  required: true,
                  validate: (value) => {
                    return (
                      value === getValues('password') ||
                      'パスワードが一致しません'
                    )
                  },
                })}
                id="password_confirm"
              />
            </div>
          </div>

          <Button
            id="signin"
            className="px-4 text-white py-2 rounded-md bg-primary shadow-md duration-200 hover:shadow-sm"
            onClick={() => {}}
          >
            設定
          </Button>
        </form>
      </article>
      <Footer />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = ctx.query.user?.toString() || ''
  const token = ctx.query.token?.toString() || ''
  if (!token) {
    return {
      notFound: true,
    }
  }
  const data = (
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    )
  ).payload
  if (data.user === user) {
    return {
      props: {
        user: data.user,
        token: token,
      },
    }
  } else {
    return {
      notFound: true,
    }
  }
}

export default VerifiedResetPassword
