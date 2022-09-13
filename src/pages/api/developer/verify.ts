import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import argon2 from "argon2"
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  switch (method) {
    case 'POST':
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 20, clientIp)
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
          id: req.body.username
        }
      })
      if (user && await argon2.verify(user.hash, req.body.password)) {
        const api = await prisma.token.findUnique({
          where: {
            userId: user.id
          }
        })
        if (api) {
          res.status(200).json(api)
        } else {
          res.status(500).json({ error: "API Token Not Found" })
        }
      } else {
        res.status(400).json({ error: "Invalid Credentials" })
        break
      }

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
