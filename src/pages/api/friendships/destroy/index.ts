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
  const { user_id, unfollow_user_id } = query
  switch (method) {
    case 'GET':
      if (user_id && unfollow_user_id) {
        const fupdate = await prisma.user.update({
          where: {
            id: unfollow_user_id
          },
          data: {
            follower: {
              disconnect: {
                id: user_id
              }
            }
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
        res.status(200).json(fupdate)
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