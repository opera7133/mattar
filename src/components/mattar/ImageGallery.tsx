import 'photoswipe/style.css'
import { Gallery, Item } from 'react-photoswipe-gallery'
import Plyr from 'plyr-react'
import 'plyr-react/plyr.css'
import { Attach } from '@prisma/client'

export const ImageGallery = ({ files }: { files: Attach[] }) => {
  return (
    <>
      {files[0].filetype === 'video' ? (
        <div className="rounded-2xl my-3 aspect-video border overflow-hidden">
          <Plyr
            source={{
              type: 'video',
              sources: [{ src: `/media/${files[0].filename}` }],
            }}
          />
        </div>
      ) : (
        <Gallery>
          <div className="flex flex-row items-center overflow-hidden rounded-2xl my-3 aspect-video border">
            {files.map((file) => (
              <Item
                original={`/media/${file.filename}`}
                thumbnail={`/media/${file.filename}`}
                width={file.width}
                height={file.height}
                key={file.filename}
              >
                {({ ref, open }) => (
                  <img
                    ref={ref}
                    onClick={open}
                    src={`/media/${file.filename}`}
                    className="object-cover shrink basis-1/2 w-full h-full min-w-0"
                  />
                )}
              </Item>
            ))}
          </div>
        </Gallery>
      )}
    </>
  )
}
