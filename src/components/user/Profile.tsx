import { Dialog, Transition } from '@headlessui/react'
import Button from 'components/Button'
import { Fragment, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import Image from 'next/image'
import { useRouter } from 'next/router'

type Inputs = {
  id: string
  name: string
  avatar: string
  description: string
  location: string
  website: string
}

export const UserProfile = ({
  props,
  isModalOpen,
  setIsModalOpen,
  showModal,
}: {
  props: any
  isModalOpen: any
  setIsModalOpen: any
  showModal: any
}) => {
  const [img, setImg] = useState(props.user?.profile_picture)
  const router = useRouter()
  const refreshData = () => {
    router.replace(router.asPath)
  }
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Inputs>()
  const onChangeInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (e: any) => {
        setImg(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (props.user && props.user.apiCredentials) {
      const res = await fetch(
        `/api/account/update_profile?api_token=${props.user.apiCredentials.token}&api_secret=${props.user.apiCredentials.secret}`,
        {
          body: JSON.stringify({
            oldId: props.user?.id,
            id: data.id,
            name: data.name,
            description: data.description,
            location: data.location,
            website: data.website,
            profile_picture: img,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      )
      const { error } = await res.json()
      if (error) {
        console.log(error)
        return
      }
      setIsModalOpen(false)
      refreshData()
    }
  }
  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog className="relative z-10" onClose={() => setIsModalOpen(false)}>
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
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  プロフィールを編集
                </Dialog.Title>
                <form className="my-3" onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="id">ユーザー名</label>
                    <input
                      type="text"
                      id="userid"
                      {...register('id', {
                        required: true,
                      })}
                      className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      defaultValue={props.user?.id}
                    />
                  </div>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="name">表示名</label>
                    <input
                      type="text"
                      id="name"
                      {...register('name', {
                        required: true,
                      })}
                      defaultValue={props.user?.name}
                      className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                    />
                  </div>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="avatar">アバター</label>
                    <div className="flex flex-row">
                      <div className="w-28 h-28 relative">
                        <Image
                          fill={true}
                          src={img || '/img/default.png'}
                          alt="avatar"
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-3 inline-flex gap-3 flex-col">
                        <label className="cursor-pointer text-center bg-primary text-white px-4 py-2 block rounded-md duration-200 shadow-md hover:shadow-sm">
                          <input
                            id="avatar"
                            type="file"
                            accept="image/apng, image/avif, image/bmp, image/gif, image/png, image/jpeg, image/svg+xml, image/webp"
                            {...register('avatar')}
                            onChange={(e) => onChangeInputFile(e)}
                            className="hidden"
                          />
                          アップロード
                        </label>
                        <Button
                          onClick={() => setImg('/img/default.png')}
                          className="bg-primary text-white shadow-md duration-200 block px-4 py-2 rounded-md hover:shadow-sm"
                        >
                          デフォルトに戻す
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="description">概要</label>
                    <textarea
                      {...register('description')}
                      id="description"
                      defaultValue={props.user?.description || ''}
                      className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                    ></textarea>
                  </div>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="location">場所</label>
                    <input
                      type="text"
                      id="location"
                      {...register('location')}
                      className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      defaultValue={props.user?.location || ''}
                    />
                  </div>
                  <div className="flex flex-col mb-2">
                    <label htmlFor="website">ウェブサイト</label>
                    <input
                      type="text"
                      id="website"
                      {...register('website', {
                        pattern:
                          /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
                      })}
                      className="bg-gray-200 dark:bg-zinc-700 border-none duration-200 focus:border-none focus:ring-gray-300 focus:bg-gray-100 dark:focus:ring-zinc-500 rounded-md dark:focus:bg-zinc-600"
                      defaultValue={props.user?.website || ''}
                    />
                  </div>
                  <div className="mt-4 text-right">
                    <Button
                      className="rounded-md bg-primary text-white shadow-md duration-200 px-4 py-2 hover:shadow-sm"
                      onClick={(e) => showModal(e)}
                    >
                      キャンセル
                    </Button>
                    <input
                      id="update"
                      type="submit"
                      value="更新"
                      className="cursor-pointer ml-3 rounded-md bg-primary text-white shadow-md duration-200 px-4 py-2 hover:shadow-sm"
                      onClick={() => {}}
                    />
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
