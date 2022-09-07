import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { mattar_id, user_id } = query
  switch (method) {
    case 'POST':
      if (!mattar_id || !user_id) {
        res.status(400).json({ error: "Provide Mattar ID and User ID" })
        break
      }
      const fav = await prisma.favorite.deleteMany({
        where: {
          userId: user_id,
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