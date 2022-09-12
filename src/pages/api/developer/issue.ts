import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import crypto from "crypto"
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]'
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
  const { user_id } = query
  const session = await unstable_getServerSession(req, res, authOptions)
  const genToken = (length: number) => {
    const S = 'abcdefgijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.randomFillSync(new Uint32Array(length)))
      .map((v) => S[v % S.length])
      .join('');
  }
  switch (method) {
    case 'GET':
      if (!session) {
        res.status(403).json({ error: "You don\'t have permission" })
        break
      }
      if (!user_id) {
        res.status(400).json({ error: "User" })
        break
      }
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 15, clientIp)
      } catch (error) {
        console.log(error)
        res.status(429).json({
          text: `Rate Limited`,
          clientIp: clientIp,
        })
        break
      }
      const user = await prisma.user.findUnique({
        where: {
          id: user_id
        }
      })
      if (!user) {
        res.status(404).json({ error: "User Not Found" })
        break
      }
      const check = await prisma.token.findUnique({
        where: {
          userId: user_id
        }
      })
      const newToken = genToken(43)
      const newSecret = genToken(43)
      if (check) {
        const update = await prisma.token.update({
          where: {
            userId: user_id
          },
          data: {
            token: newToken,
            secret: newSecret
          }
        })
        res.status(200).json(update)
        break
      } else {
        const create = await prisma.token.create({
          data: {
            userId: user_id,
            token: newToken,
            secret: newSecret
          }
        })
        res.status(200).json(create)
        break
      }

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}