import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
const prisma = new PrismaClient()

const checkToken = async (req: NextApiRequest) => {
  const query = req.query
  const headers = req.headers
  const { api_token: q_api_token, api_secret: q_api_secret } = query
  const { api_token: h_api_token, api_secret: h_api_secret } = headers
  if ((!q_api_token || !q_api_secret) && (!h_api_token || !h_api_secret)) {
    return false
  }
  const token = await prisma.token.findUnique({
    where: {
      token: q_api_token?.toString() || h_api_token?.toString()
    }
  })
  if (!token) {
    return false
  }
  if (q_api_secret) {
    return token.secret === q_api_secret
  } else {
    return token.secret === h_api_secret
  }
}
export default checkToken
