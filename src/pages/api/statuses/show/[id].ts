import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { id } = query
  switch (method) {
    case 'GET':
      if (!id) {
        res.status(400).json({ error: "Provide Mattar ID" })
        break
      }
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 200, clientIp)
      } catch (error) {
        console.log(error)
        res.status(429).json({
          text: `Rate Limited`,
          clientIp: clientIp,
        })
        break
      }
      const mattar = await prisma.mattar.findUnique({
        where: {
          id: id
        },
        select: {
          id: true,
          message: true,
          source: true,
          user: {
            select: {
              id: true,
              name: true,
              description: true,
              location: true,
              website: true,
              profile_picture: true,
              createdAt: true
            }
          },
          isRemattar: true,
          createdAt: true,
        }
      })
      if (!mattar) {
        res.status(404).json({ error: "Mattar Not Found" })
        break
      }
      res.status(200).json(mattar)
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}