import 'photoswipe/style.css'
import { Gallery, Item } from 'react-photoswipe-gallery'
import Plyr from 'plyr-react'
import 'plyr-react/plyr.css'
import { Attach } from '@prisma/client'
import { twMerge } from 'tailwind-merge'
import Image from 'next/image'
import { Ref } from 'react'

export const ImageGallery = ({ files }: { files: Attach[] }) => {
  return (
    <>
      {files[0].filetype === 'video' ? (
        <div className="rounded-2xl my-3 aspect-video border overflow-hidden">
          <Plyr
            source={{
              type: 'video',
              sources: [{ src: files[0].filename }],
            }}
          />
        </div>
      ) : (
        <Gallery>
          <div
            className={twMerge(
              'items-center overflow-hidden rounded-2xl my-3 aspect-video border',
              files.length > 2
                ? 'grid grid-rows-2 grid-flow-col'
                : 'flex flex-row'
            )}
          >
            {files.map((file, i) => (
              <Item
                original={file.filename}
                thumbnail={file.filename}
                width={file.width}
                height={file.height}
                key={file.filename}
              >
                {({ ref, open }) => (
                  <div
                    className={twMerge(
                      'relative shrink w-full h-full min-w-0',
                      files.length !== 1 && 'basis-1/2',
                      files.length === 3 && i == 0 && 'row-span-2'
                    )}
                  >
                    <Image
                      ref={ref as Ref<HTMLImageElement>}
                      alt={file.filename}
                      onClick={open}
                      src={file.filename}
                      fill={true}
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                )}
              </Item>
            ))}
          </div>
        </Gallery>
      )}
    </>
  )
}
