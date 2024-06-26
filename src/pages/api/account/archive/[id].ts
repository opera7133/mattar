import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import checkToken from 'lib/checkToken'
import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"
const prisma = new PrismaClient()

const limitChecker = LimitChecker()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  switch (method) {
    case 'GET':
      const token = await checkToken(req)
      if (!token) {
        res.status(400).json({ error: "You don\'t have permission" })
        break
      }
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 3, clientIp)
      } catch (error) {
        console.log(error)
        res.status(429).json({
          text: `Rate Limited`,
          clientIp: clientIp,
        })
        break
      }
      const tokenId = await prisma.token.findUnique({
        where: {
          token: query.api_token?.toString()
        },
        select: {
          userId: true
        }
      })
      const userId = tokenId?.userId
      if (userId) {
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            website: true,
            birthday: true,
            profile_picture: true,
            mattars: {
              select: {
                id: true,
                message: true,
                source: true,
                createdAt: true,
              }
            },
            follower: {
              select: {
                id: true,
                name: true,
                description: true,
                location: true,
                website: true,
                birthday: true,
                profile_picture: true,
              }
            },
            following: {
              select: {
                id: true,
                name: true,
                description: true,
                location: true,
                website: true,
                birthday: true,
                profile_picture: true,
              }
            },
            createdAt: true
          },
        })
        if (!user) {
          res.status(404).json({ error: "User not found" })
          break
        }
        res.setHeader('Content-disposition', `attachment; filename=${userId}_data.json`)
        res.setHeader('Content-Type', 'application/json')
        res.send(user)
        res.status(200)
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
