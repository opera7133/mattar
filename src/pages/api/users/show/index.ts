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
  const { user_id, screen_name } = query
  switch (method) {
    case 'GET':
      if (user_id) {
        const user = await prisma.user.findUnique({
          where: {
            id: user_id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            website: true,
            profile_picture: true,
            mattars: true,
            createdAt: true
          },
        })
        res.status(200).json(user)
        break
      } else if (screen_name) {
        const user = await prisma.user.findUnique({
          where: {
            name: screen_name,
          },
          select: {
            id: true,
            name: true,
            description: true,
            profile_picture: true,
            mattars: true,
            createdAt: true
          },
        })
        res.status(200).json(user)
        break
      } else {
        res.status(400).json({ error: "Provide User ID or Screen Name" })
        break
      }

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}