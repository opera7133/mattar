import type { NextApiRequest, NextApiResponse } from 'next'
import stringWidth from 'string-width'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { user_id, count } = query
  switch (method) {
    case 'GET':
      if (count && Number(count) > 200) {
        return res.status(400).json({ error: "maximum count is 200" })
        break
      }
      if (user_id) {
        const user = await prisma.user.findUnique({
          where: {
            id: user_id,
          },
          select: {
            id: true,
            follower: {
              select: {
                id: true,
                name: true,
                description: true,
                location: true,
                website: true,
                profile_picture: true,
                createdAt: true
              }
            }
          }
        })
        if (!user) {
          return res.status(404).json({ error: "User Not Found" })
          break
        }
        res.status(200).json(user)
        break
      } else {
        res.status(400).json({ error: "Provide User ID" })
        break
      }

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}