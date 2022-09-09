import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import checkToken from 'lib/checkToken'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { mattar_id } = query
  switch (method) {
    case 'POST':
      const token = await checkToken(req)
      if (!token) {
        res.status(400).json({ error: "You don\'t have permission" })
        break
      }
      if (!mattar_id) {
        res.status(400).json({ error: "Provide Mattar ID and User ID" })
        break
      }
      const tokenId = await prisma.token.findUnique({
        where: {
          token: query.api_token
        },
        select: {
          userId: true
        }
      })
      const userId = tokenId?.userId
      const fav = await prisma.favorite.deleteMany({
        where: {
          userId: userId,
          mattarId: mattar_id
        }
      })
      res.status(200).json(fav)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}