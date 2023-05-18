import { Layout } from 'components/Layout'
import Head from 'next/head'
import Footer from 'components/Footer'
import Button from 'components/Button'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const ResetPassword = ({ user }: { user: string }) => {
  type Inputs = {
    email: string
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const wait = toast.loading('送信中です...')
    const res = await (
      await fetch(`/api/auth/reset?email=${data.email}`)
    ).json()
    if (res.status === 'success') {
      toast.success('入力されたメールアドレス宛に送信しました！', {
        id: wait,
      })
    } else {
      toast.error(res.error, {
        id: wait,
      })
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
              <label className="text-lg" htmlFor="email">
                登録したメールアドレス
              </label>
              <input
                className={classNames(
                  errors.email ? 'bg-red-200' : '',
                  'bg-gray-200 border-none rounded-md text-lg px-5 py-3 duration-200 text-black focus:ring-0 focus:bg-gray-100'
                )}
                type="email"
                {...register('email', {
                  required: true,
                  pattern:
                    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
                })}
                id="email"
                placeholder="sample@example.com"
              />
            </div>
          </div>

          <Button
            id="send"
            className="px-4 text-white py-2 rounded-md bg-primary shadow-md duration-200 hover:shadow-sm"
            onClick={() => {}}
          >
            送信
          </Button>
        </form>
      </article>
      <Footer />
    </Layout>
  )
}

export default ResetPassword
