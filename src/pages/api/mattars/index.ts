import type { NextApiRequest, NextApiResponse } from 'next'
import requestIp from 'request-ip'
import stringWidth from 'string-width'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const clientIp = requestIp.getClientIp(req) || 'IP_NOT_FOUND'
  const query = req.query
  const { id } = query
  switch (method) {
    case 'GET':
      const mattars = await prisma.mattar.findMany()
      res.status(200).json(mattars)
      break

    case 'POST':
      if (stringWidth(req.body.message.replace(/\n/g, '')) > 60) {
        res.status(400).json({ error: "Your message is too long" })
        break
      }
      req.body.ip = clientIp
      const mattar = await prisma.mattar.create({
        data: req.body,
      })
      res.status(200).json(mattar)
      break

    case 'DELETE':
      if (!id) {
        res.status(400).json({ error: "Provide Mattar ID" })
      }
      const deleteMattar = await prisma.mattar.delete({
        where: {
          id: id
        },
      })
      res.status(200).json(deleteMattar)
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}