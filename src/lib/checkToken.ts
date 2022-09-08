import { PrismaClient } from '@prisma/client'
import { NextApiRequest } from 'next'
const prisma = new PrismaClient()

const checkToken = async (req: NextApiRequest) => {
  const query = req.query
  const { api_token, api_secret } = query
  if (!req.headers.referer?.startsWith(process.env.NEXTAUTH_URL)) {
    if (!api_token || !api_secret) {
      return false
    }
  } else {
    return true
  }
  const res = await prisma.token.findUnique({
    where: {
      token: api_token
    }
  })
  if (!res) {
    return false
  }
  return res.secret === api_secret
}
export default checkToken