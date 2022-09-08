import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { api_token, api_secret, mattar_id, user_id } = query
  switch (method) {
    case 'POST':
      if (!req.headers.referer?.startsWith(process.env.NEXTAUTH_URL)) {
        if (!api_token || !api_secret) {
          res.status(403).json({ error: "You don\'t have permission" })
          break
        }
      }
      if (!mattar_id || !user_id) {
        res.status(400).json({ error: "Provide Mattar ID and User ID" })
        break
      }
      const check = await prisma.mattar.findUnique({
        where: {
          id: mattar_id
        },
        include: {
          remattarParent: true
        }
      })
      if (check.remattarParent.length > 0) {
        res.status(400).json
      }
      const mattar = await prisma.mattar.create({
        data: {
          userId: user_id,
          isRemattar: true,
        }
      })
      const remattar = await prisma.remattar.create({
        data: {
          userId: user_id,
          mattarId: mattar_id,
          remattarId: mattar.id
        }
      })
      res.status(200).json(remattar)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}