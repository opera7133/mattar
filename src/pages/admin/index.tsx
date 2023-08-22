import Footer from 'components/Footer'
import { Layout } from 'components/Layout'
import prisma from 'lib/prisma'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import { GetServerSideProps } from 'next/types'
import { FiUsers } from 'react-icons/fi'
import { FaPencil } from 'react-icons/fa6'

export default function FAQ({
  userCount,
  postCount,
}: {
  userCount: number
  postCount: number
}) {
  return (
    <Layout>
      <Head>
        <title>管理画面 | mattar.li</title>
        <meta name="robots" content="noindex nofollow" />
      </Head>
      <div className="pt-10 min-h-[60vh] container mx-auto px-5 max-w-6xl">
        <h3 className="text-2xl font-bold mb-4">統計</h3>
        <div className="flex gap-3">
          <div className="bg-gray-100 inline-flex justify-between gap-4 items-center px-4 py-2 rounded-md">
            <FiUsers size={28} />
            <div>
              <h4 className="text-xl font-bold">{userCount}</h4>
              <p>ユーザー</p>
            </div>
          </div>
          <div className="bg-gray-100 inline-flex justify-between gap-4 items-center px-4 py-2 rounded-md">
            <FaPencil size={28} />
            <div>
              <h4 className="text-xl font-bold">{postCount}</h4>
              <p>投稿</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  )
}

export const getServerSideProps = async (ctx: any) => {
  const session = await getSession(ctx)
  if (session && session.user) {
    const userCount = await prisma.user.count()
    const postCount = await prisma.mattar.count()
    return {
      props: {
        userCount,
        postCount,
      },
    }
  } else {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    }
  }
}
