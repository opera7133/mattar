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
  const { api_token, api_secret } = query
  const toHtmlEntities = (text: string) => {
    return text.replace(/./gm, function (s) {
      return (s.match(/[a-z0-9\s]+/i)) ? s : "&#" + s.charCodeAt(0) + ";";
    })
  }
  switch (method) {
    case 'POST':
      if (!req.headers.referer?.startsWith(process.env.NEXTAUTH_URL)) {
        if (!api_token || !api_secret) {
          res.status(403).json({ error: "You don\'t have permission" })
          break
        }
      }
      if (stringWidth(req.body.message.replace(/\n/g, '')) > 60) {
        res.status(400).json({ error: "Your message is too long" })
        break
      }
      req.body.ip = clientIp
      req.body.message = toHtmlEntities(req.body.message)
      const mattar = await prisma.mattar.create({
        data: req.body,
      })
      const incrementCount = await prisma.user.update({
        where: {
          id: req.body.userId
        },
        data: {
          mattar_count: {
            increment: 1
          }
        },
      })
      res.status(200).json(mattar)
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}