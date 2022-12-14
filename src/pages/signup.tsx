import { Dialog, Transition } from '@headlessui/react'
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
import { passwordStrength } from 'check-password-strength'
import { Fragment, useState } from 'react'

export default function SignUp() {
  const [isOpen, setIsOpen] = useState(false)
  const [errorText, setErrorText] = useState('')
  const router = useRouter()
  const { data: session } = useSession()

  type Inputs = {
    id: string
    name: string
    email: string
    password: string
    invite: string
    agree: boolean
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
    const emailDomain = data.email.split('@')[1]
    const ignoreDomains = ['example.com', 'example.org']
    /*if (ignoreDomains.includes(emailDomain)) {
      return
    }*/
    const res = await fetch('/api/account/create', {
      body: JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        invite: data.invite,
        password: data.password,
        profile_picture: '/img/default.png',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const { error } = await res.json()
    if (error) {
      setIsOpen(true)
      setErrorText(error)
      return
    }
    const mail = await fetch(`/api/account/verify/issue?user_id=${data.id}`)
    const { mailerror } = await mail.json()
    if (mailerror) {
      setIsOpen(true)
      setErrorText(mailerror)
      return
    }
    await signIn<any>('credentials', {
      redirect: true,
      username: data.id,
      password: data.password,
      callbackUrl: `${window.location.origin}`,
    }).then((res) => {
      if (res?.error) {
        console.error('UserId,Password????????????????????????????????????')
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
          <title>???????????? | mattar.li</title>
        </Head>
        <Header />
        <article className="pt-10 mb-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
          <h1 className="text-2xl font-bold mb-3">????????????</h1>
          <p>
            ???????????????????????????????????????
            <Link href="/signin">
              <a className="text-sky-500 duration-200 hover:text-sky-800">
                ????????????
              </a>
            </Link>
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="max-w-xl flex flex-col gap-3 my-5">
              <div className="inline-flex flex-col">
                <label className="text-lg" htmlFor="userid">
                  ???????????????
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
                <label className="text-lg" htmlFor="name">
                  ?????????
                </label>
                <input
                  className={classNames(
                    errors.name ? 'bg-red-200' : '',
                    'bg-gray-200 border-none rounded-md text-lg px-5 py-3 duration-200 text-black focus:ring-0 focus:bg-gray-100'
                  )}
                  type="text"
                  {...register('name', {
                    required: true,
                  })}
                  id="name"
                  placeholder="John Doe"
                />
              </div>

              <div className="inline-flex flex-col">
                <label className="text-lg" htmlFor="email">
                  ?????????????????????
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

              <div className="inline-flex flex-col">
                <label className="text-lg" htmlFor="password">
                  ???????????????
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
                      message: '8????????????',
                    },
                    pattern:
                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  })}
                  id="password"
                />
                <div className="flex my-3">
                  <div className="w-1/4 px-1">
                    <div
                      className={classNames(
                        'h-2 rounded-xl transition-colors bg-gray-200',
                        passwordStrength(watchPassword).value === 'Too weak' &&
                          'bg-red-500',
                        passwordStrength(watchPassword).value === 'Weak' &&
                          'bg-orange-500',
                        passwordStrength(watchPassword).value === 'Medium' &&
                          'bg-yellow-400',
                        passwordStrength(watchPassword).value === 'Strong' &&
                          'bg-green-500'
                      )}
                    ></div>
                  </div>
                  <div className="w-1/4 px-1">
                    <div
                      className={classNames(
                        'h-2 rounded-xl transition-colors bg-gray-200',
                        passwordStrength(watchPassword).value === 'Weak' &&
                          'bg-orange-500',
                        passwordStrength(watchPassword).value === 'Medium' &&
                          'bg-yellow-400',
                        passwordStrength(watchPassword).value === 'Strong' &&
                          'bg-green-500'
                      )}
                    ></div>
                  </div>
                  <div className="w-1/4 px-1">
                    <div
                      className={classNames(
                        'h-2 rounded-xl transition-colors bg-gray-200',
                        passwordStrength(watchPassword).value === 'Medium' &&
                          'bg-yellow-400',
                        passwordStrength(watchPassword).value === 'Strong' &&
                          'bg-green-500'
                      )}
                    ></div>
                  </div>
                  <div className="w-1/4 px-1">
                    <div
                      className={classNames(
                        'h-2 rounded-xl transition-colors bg-gray-200',
                        passwordStrength(watchPassword).value === 'Strong' &&
                          'bg-green-500'
                      )}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="inline-flex flex-col">
                <label className="text-lg" htmlFor="name">
                  ???????????????
                </label>
                <input
                  className={classNames(
                    errors.invite ? 'bg-red-200' : '',
                    'bg-gray-200 border-none rounded-md text-lg px-5 py-3 duration-200 text-black focus:ring-0 focus:bg-gray-100'
                  )}
                  type="text"
                  {...register('invite', {
                    required: true,
                  })}
                  id="invite"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  className={classNames(
                    errors.agree ? 'ring-red-500 ring' : '',
                    'border-gray-300 rounded duration-200 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-opacity-50'
                  )}
                  id="privacy"
                  {...register('agree', { required: true })}
                />
                <label className="text-lg" htmlFor="privacy">
                  <a
                    href="/privacy"
                    target="_blank"
                    className="text-sky-500 duration-200 hover:text-sky-800"
                  >
                    <span className="ml-2">??????????????????????????????</span>
                  </a>
                  ?????????
                  <a
                    href="/tos"
                    target="_blank"
                    className="text-sky-500 duration-200 hover:text-sky-800"
                  >
                    <span>????????????</span>
                  </a>
                  ???????????????????????????????????????
                </label>
              </div>
            </div>

            <Button
              id="signup"
              className="px-4 text-white py-2 rounded-md bg-primary shadow-md duration-200 hover:shadow-sm"
              onClick={() => {}}
            >
              ??????
            </Button>
          </form>
          <Transition appear show={isOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => setIsOpen(false)}
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
                        ??????????????????????????????
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{errorText}</p>
                      </div>

                      <div className="mt-4 text-right">
                        <button
                          type="button"
                          className="bg-red-600 shadow-md rounded-md text-white px-4 py-2 duration-200 hover:shadow-sm"
                          onClick={() => setIsOpen(false)}
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
        </article>
        <Footer />
      </div>
    )
  }
}

export const getServerSideProps = async (context: CtxOrReq | undefined) => {
  return {
    props: {
      title: 'login',
      csrfToken: await getCsrfToken(context),
    },
  }
}
