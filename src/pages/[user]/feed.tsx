import prisma, { Mattar } from 'lib/prisma'
import { GetServerSidePropsContext } from 'next'
import RSS from 'rss'

async function generateFeedXml(user: string) {
  const feed = new RSS({
    title: user + ' /  mattar.li',
    description: 'マターリ',
    site_url: process.env.NEXT_PUBLIC_BASE_URL || '',
    feed_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${user}/feed`,
    language: 'ja',
  })

  const mattars: Mattar[] = JSON.parse(
    JSON.stringify(
      await prisma.mattar.findMany({
        where: {
          userId: user,
        },
      })
    )
  )
  mattars.forEach((mattar) => {
    feed.item({
      title: mattar.message,
      description: mattar.message,
      date: new Date(mattar.createdAt),
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/${user}/status/${mattar.id}`,
    })
  })

  return feed.xml()
}

export const getServerSideProps = async ({
  res,
  query,
}: GetServerSidePropsContext) => {
  const id = query.user
  const xml = await generateFeedXml(id?.toString() || '')
  if (!id) {
    return {
      notFound: true,
    }
  }

  res.statusCode = 200
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
  res.setHeader('Content-Type', 'text/xml')
  res.end(xml)

  return {
    props: {},
  }
}

const Feed = () => null
export default Feed
