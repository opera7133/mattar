import Button from 'components/Button'
import Footer from 'components/Footer'
import Head from 'next/head'
import Link from 'next/link'
import { useForm, SubmitHandler } from 'react-hook-form'
import { getCsrfToken, signIn, useSession } from 'next-auth/react'
import { CtxOrReq } from 'next-auth/client/_utils'
import { useRouter } from 'next/router'
import { Layout } from 'components/Layout'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { ErrorCode } from 'utils/ErrorCode'

export default function SignIn({ csrfToken }: { csrfToken: string }) {
  const router = useRouter()
  const [showOTP, setShowOTP] = useState(false)
  const { data: session } = useSession()
  type Inputs = {
    id: string
    password: string
    totp?: number
  }

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm<Inputs>()

  const watchPassword = watch('password', '')

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const wait = toast.loading('ログイン中です...')
    type Cred = {
      redirect: boolean
      username: string
      password: string
      callbackUrl: string
      totpCode?: number
    }
    let cred: Cred = {
      redirect: false,
      username: data.id,
      password: data.password,
      callbackUrl: `${window.location.origin}`,
    }
    if (data.totp) {
      cred = {
        ...cred,
        totpCode: data.totp,
      }
    }
    await signIn<any>('credentials', cred).then((res) => {
      if (!res || res?.error) {
        console.log(res)
        if (res?.error === ErrorCode.SecondFactorRequired) {
          setShowOTP(true)
          toast('2段階認証コードを入力してください', {
            id: wait,
          })
        } else {
          toast.error('ユーザーID、パスワードを正しく入力してください', {
            id: wait,
          })
        }
      } else {
        toast.success('ログインしました！', {
          id: wait,
        })
        router.push('/')
      }
    })
  }

  const classNames = (...classes: any[]) => {
    return classes.filter(Boolean).join(' ')
  }
  if (session) {
    router.push('/')
  } else {
    return (
      <Layout>
        <Head>
          <title>ログイン | mattar.li</title>
        </Head>
        <article className="pt-10 mb-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
          <h1 className="text-2xl font-bold mb-3">ログイン</h1>
          <p>
            アカウントがありませんか？
            <Link
              href="/signup"
              className="text-sky-500 duration-200 hover:text-sky-800"
            >
              新規登録
            </Link>
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="max-w-xl flex flex-col gap-3 my-5">
              <div className="inline-flex flex-col">
                <label className="text-lg" htmlFor="userid">
                  ユーザー名 または メールアドレス
                </label>
                <input
                  className={classNames(
                    errors.id ? 'bg-red-200' : '',
                    'bg-gray-200 border-none rounded-md text-lg px-5 py-3 duration-200 text-black focus:ring-0 focus:bg-gray-100'
                  )}
                  type="text"
                  {...register('id', { required: true })}
                  id="userid"
                  placeholder="john_doe"
                />
              </div>

              <div className="inline-flex flex-col">
                <label className="text-lg" htmlFor="password">
                  パスワード
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
                  })}
                  id="password"
                />
              </div>

              {showOTP && (
                <div className="inline-flex flex-col">
                  <label className="text-lg" htmlFor="totp">
                    2段階認証コード
                  </label>
                  <input
                    className={classNames(
                      errors.totp ? 'bg-red-200' : '',
                      'bg-gray-200 border-none rounded-md text-lg px-5 py-3 duration-200 text-black focus:ring-0 focus:bg-gray-100'
                    )}
                    type="text"
                    {...register('totp', {
                      minLength: 6,
                      maxLength: 6,
                    })}
                    id="totp"
                  />
                </div>
              )}
            </div>

            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

            <Button
              id="signin"
              className="px-4 text-white py-2 rounded-md bg-primary shadow-md duration-200 hover:shadow-sm"
              onClick={() => {}}
            >
              ログイン
            </Button>
          </form>
          <p className="my-4">
            パスワードをお忘れですか？
            <Link
              href="/reset"
              className="text-sky-500 duration-200 hover:text-sky-800"
            >
              パスワードをリセット
            </Link>
          </p>
        </article>
        <Footer />
      </Layout>
    )
  }
}

export const getServerSideProps = async (context: CtxOrReq | undefined) => {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  }
}
