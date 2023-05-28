import type { NextApiRequest } from 'next'
import { PrismaClient } from '@prisma/client'
import checkToken from 'lib/checkToken'
import { NextApiResponseServerIO } from "types/socket"
import { unlink, unlinkSync } from 'fs'
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  const { method } = req
  const { id, mattar_id, api_token } = req.query
  switch (method) {
    case 'POST':
      const token = await checkToken(req)
      if (!token) {
        res.status(400).json({ error: "You don\'t have permission" })
        break
      }
      if (!id) {
        res.status(400).json({ error: "Provide Mattar ID" })
        break
      }
      const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
      try {
        await limitChecker.check(res, 150, clientIp)
      } catch (error) {
        console.log(error)
        res.status(429).json({
          text: `Rate Limited`,
          clientIp: clientIp,
        })
        break
      }
      const getMattar = await prisma.mattar.findUnique({
        where: {
          id: id.toString()
        },
        include: {
          attaches: true
        }
      })
      if (!getMattar) {
        res.status(404).json({ error: "Mattar Not Found" })
        break
      }
      const tokenId = await prisma.token.findUnique({
        where: {
          token: api_token?.toString()
        },
        select: {
          userId: true
        }
      })
      if (getMattar.userId !== tokenId?.userId) {
        res.status(403).json({ error: "You don\'t have permission" })
      }
      if (getMattar.attaches) {
        for (const attach of getMattar.attaches) {
          unlinkSync(`./public/media/${attach.filename}`)
        }
      }
      const deleteMattar = await prisma.mattar.delete({
        where: {
          id: id.toString()
        },
      })
      const decrementCount = await prisma.user.update({
        where: {
          id: getMattar?.userId
        },
        data: {
          mattar_count: {
            decrement: 1
          }
        },
      })
      res.socket.server.io.emit("delete", getMattar?.message)
      res.status(200).json(deleteMattar)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
