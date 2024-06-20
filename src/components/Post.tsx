import { useState } from 'react'
import Button from './Button'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import stringWidth from 'string-width'
import { BsImage, BsX } from 'react-icons/bs'

export const PostMattar = ({ props }: { props: any }) => {
  const [text, setText] = useState('')
  const [thumbs, setThumbs] = useState<Array<string>>([])
  const [attaches, setAttaches] = useState<Array<File>>([])
  const router = useRouter()
  const refreshData = () => {
    router.replace(router.asPath)
  }
  const checkTextArea = (e: any) => {
    const newText = e.target.value.replace(/\n/g, '')
    setText(e.target.value)
  }
  const deleteAttach = (index: number) => {
    setThumbs(thumbs.filter((thumb, i) => i !== index))
    setAttaches(attaches.filter((attach, i) => i !== index))
  }
  const onChangeInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allowed = [
      'image/apng',
      'image/avif',
      'image/bmp',
      'image/gif',
      'image/png',
      'image/jpeg',
      'image/webp',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/mp4',
      'video/mpeg',
      'video/webm',
      'video/quicktime',
    ]
    if (e.target.files) {
      const fileCount = e.target.files.length
      if (fileCount > 4 || attaches.length >= 4) {
        toast.error('ファイルは最大4つまでです')
        return
      }
      const sets: Array<string> = []
      const files = Array.from(e.target.files)
      for (const [index, file] of Object.entries(files)) {
        if (
          attaches.length >= 1 &&
          attaches[attaches.length - 1].type.slice(0, 5) === 'video'
        ) {
          toast.error('画像と動画は同時にアップロードできません')
          return
        }
        if (
          file.type.slice(0, 5) === 'video' &&
          (fileCount > 1 || attaches.length >= 1)
        ) {
          toast.error('画像と動画は同時にアップロードできません')
          return
        }
        if (allowed.includes(file.type)) {
          const reader = new FileReader()
          reader.onload = (e: any) => {
            sets.push(e.target.result)
            if (Number(index) + 1 === fileCount) {
              setThumbs(Array.from(new Set([...thumbs, ...sets])))
            }
          }
          reader.readAsDataURL(file)
        }
      }
      setAttaches(
        Array.from(
          new Map(
            [...attaches, ...files].map((file) => [file.name, file])
          ).values()
        )
      )
    }
  }
  const postMattar = async () => {
    if (props.user && props.user.apiCredentials) {
      const load = toast.loading('投稿中です...')
      const mediaIds = []
      for (const file of attaches) {
        const body = new FormData()
        body.append('file', file)
        const mres = await (
          await fetch(`/api/media/upload`, {
            method: 'POST',
            body: body,
            headers: {
              'x-api-key': props.user.apiCredentials.token,
              'x-api-secret': props.user.apiCredentials.secret,
            },
          })
        ).json()
        if (mres.error) {
          toast.error('ファイルのアップロードに失敗しました', {
            id: load,
          })
          return
        } else {
          mediaIds.push({ id: mres.id, filetype: mres.filetype })
        }
      }

      const res = await (
        await fetch(
          `/api/statuses/update?api_token=${props.user?.apiCredentials.token}&api_secret=${props.user?.apiCredentials.secret}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: text,
              attaches: mediaIds,
              source: 'Mattar Web Client',
              userId: props.user?.id,
            }),
          }
        )
      ).json()
      if (res.error) {
        if (res.error === 'Your message is too long') {
          toast.error('ツイートが長すぎます！', {
            id: load,
          })
        } else if (res.error === 'The message must have some text') {
          toast.error('テキストを入力してください！', {
            id: load,
          })
        } else {
          toast.error(res.error)
        }
      } else {
        toast.success('ツイートを投稿しました！', {
          id: load,
        })
        setText('')
        setThumbs([])
        setAttaches([])
        refreshData()
      }
    }
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xl my-2">いま、どうしてる？</p>
        <p
          className={
            60 - stringWidth(text.replace(/\n/g, '')) < 0
              ? 'font-bold text-3xl opacity-80 text-red-500'
              : 'font-bold text-3xl opacity-40'
          }
        >
          {60 - stringWidth(text.replace(/\n/g, ''))}
        </p>
      </div>
      <textarea
        onChange={checkTextArea}
        value={text}
        className="rounded-md focus:ring-0 focus:border-gray-500 w-full h-auto text-black"
      ></textarea>
      <div className="flex flex-col gap-3 md:gap-0 md:flex-row justify-between">
        <div className="flex flex-wrap items-start gap-2">
          {thumbs.map((thumb, i) =>
            thumb.startsWith('data:image') ? (
              <div className="relative" key={i}>
                <img className="w-20 aspect-square object-cover" src={thumb} />
                <button
                  onClick={() => deleteAttach(i)}
                  className="absolute top-0.5 right-0.5 bg-gray-800 opacity-70 rounded-full"
                >
                  <BsX color="white" size={20} />
                </button>
              </div>
            ) : (
              <div className="relative" key={i}>
                <video
                  src={thumb}
                  className="w-20 aspect-square object-cover pointer-events-none relative"
                  controls={false}
                ></video>
                <button
                  onClick={() => deleteAttach(i)}
                  className="absolute top-0.5 right-0.5 bg-gray-800 opacity-70 rounded-full"
                >
                  <BsX color="white" size={20} />
                </button>
              </div>
            )
          )}
        </div>
        <div className="flex justify-end items-start gap-2">
          <label className="cursor-pointer text-center bg-primary text-white px-4 py-3 block rounded-md duration-200 shadow-md hover:shadow-sm">
            <input
              id="attach"
              type="file"
              accept="image/apng, image/avif, image/bmp, image/gif, image/png, image/jpeg, image/webp, video/x-msvideo, video/mp4, video/mpeg, video/webm, video/quicktime, video/x-ms-wmv"
              onChange={(e) => onChangeInputFile(e)}
              className="hidden"
              multiple
            />
            <BsImage />
          </label>
          <Button
            id="post"
            className="block bg-primary text-white px-4 py-2 rounded-md shadow-md hover:shadow-sm duration-200"
            onClick={() => postMattar()}
          >
            つぶやく
          </Button>
        </div>
      </div>
    </div>
  )
}
