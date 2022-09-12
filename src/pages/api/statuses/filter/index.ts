import { NextApiRequest, NextApiResponse } from 'next'
import { Server as NetServer, Socket } from "net"
import { Server as ServerIO } from "socket.io"
import { NextApiResponseServerIO } from "types/socket"
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import { LimitChecker } from 'lib/limitChecker'
import requestIp from "request-ip"

const limitChecker = LimitChecker()

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  const api_token = req.headers["x-api-key"]
  const api_secret = req.headers["x-api-secret"]
  if (!api_token || !api_secret) {
    res.status(403).json({ error: "Access Denied" })
    res.end();
  }
  const clientIp = requestIp.getClientIp(req) || "IP_NOT_FOUND"
  try {
    await limitChecker.check(res, 200, clientIp)
  } catch (error) {
    console.log(error)
    return res.status(429).json({
      text: `Rate Limited`,
      clientIp: clientIp,
    })
  }
  const token = await prisma.token.findUnique({
    where: {
      token: api_token
    }
  })
  if (!token) {
    res.status(403).json({ error: "Access Denied" })
    res.end();
  } else if (token.secret !== api_secret) {
    res.status(403).json({ error: "Access Denied" })
    res.end();
  }

  if (!res.socket.server.io) {
    console.log(`New Socket.io server...`)
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: `/api/statuses/filter`,
    })
    res.socket.server.io = io
  }
  res.end();
}