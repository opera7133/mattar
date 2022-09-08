import { NextApiRequest, NextApiResponse } from 'next'
import { Server as NetServer, Socket } from "net"
import { Server as ServerIO } from "socket.io"
import { NextApiResponseServerIO } from "types/socket"
import checkToken from 'lib/checkToken'

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  const token = await checkToken(req)
  if (!token) {
    res.status(400).json({ error: "You don\'t have permission" })
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