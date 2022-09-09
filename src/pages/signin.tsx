import Button from 'components/Button'
import Footer from 'components/Footer'
import Header from 'components/Header'
import Head from 'next/head'
import Link from 'next/link'
import { BsEyeFill, BsEyeSlashFill } from 'react-icons/bs'
import { useForm, SubmitHandler } from 'react-hook-form'
import { getCsrfToken, signIn, useSession } from 'next-auth/react'
import { CtxOrReq } from 'next-auth/client/_utils'
import { useRouter } from 'next/router'

export default function SignIn({ csrfToken }: { csrfToken: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  type Inputs = {
    id: string
    password: string
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
    await signIn<any>('credentials', {
      redirect: true,
      username: data.id,
      password: data.password,
      callbackUrl: `${window.location.origin}`,
    }).then((res) => {
      if (res?.error) {
        console.error('UserId,Passwordを正しく入力してください')
      } else {
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
      <div className="">
        <Head>
          <title>ログイン | mattar.li</title>
        </Head>
        <Header />
        <article className="pt-10 mb-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
          <h1 className="text-2xl font-bold mb-3">ログイン</h1>
          <p>
            アカウントがありませんか？
            <Link href="/signup">
              <a className="text-sky-500 duration-200 hover:text-sky-800">
                新規登録
              </a>
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
        </article>
        <Footer />
      </div>
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
