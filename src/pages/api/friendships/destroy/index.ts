import type { NextApiRequest, NextApiResponse } from 'next'
import stringWidth from 'string-width'
import { PrismaClient } from '@prisma/client'
import checkToken from 'lib/checkToken'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { unfollow_user_id } = query
  switch (method) {
    case 'GET':
      const token = await checkToken(req)
      if (!token) {
        res.status(400).json({ error: "You don\'t have permission" })
        break
      }
      if (unfollow_user_id) {
        const tokenId = await prisma.token.findUnique({
          where: {
            token: query.api_token
          },
          select: {
            userId: true
          }
        })
        const userId = tokenId?.userId
        const fupdate = await prisma.user.update({
          where: {
            id: unfollow_user_id
          },
          data: {
            follower: {
              disconnect: {
                id: userId
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
        if (!fupdate) {
          res.status(400).json({ error: "User Not Found" })
          break
        }
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