import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
const prisma = new PrismaClient()

const checkToken = async (req: NextApiRequest) => {
  const query = req.query
  const { api_token, api_secret } = query
  if (!api_token || !api_secret) {
    return false
  }
  const token = await prisma.token.findUnique({
    where: {
      token: api_token.toString()
    }
  })
  if (!token) {
    return false
  }
  return token.secret === api_secret
}
export default checkToken
