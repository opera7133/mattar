import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import NextCors from 'nextjs-cors'
const prisma = new PrismaClient()

const checkToken = async (req: NextApiRequest, res: NextApiResponse) => {
  const query = req.query
  const { api_token, api_secret } = query
  if (!req.headers.referer?.startsWith(process.env.NEXTAUTH_URL)) {
    if (!api_token || !api_secret) {
      return false
    }
  } else {
    return true
  }
  await NextCors(req, res, {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: process.env.NEXTAUTH_URL,
  })
  const token = await prisma.token.findUnique({
    where: {
      token: api_token
    }
  })
  if (!token) {
    return false
  }
  return token.secret === api_secret
}
export default checkToken