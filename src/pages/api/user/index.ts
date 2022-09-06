import type { NextApiRequest, NextApiResponse } from 'next'
import stringWidth from 'string-width'
import { PrismaClient } from '@prisma/client'
import argon2 from "argon2"
import crypto from "crypto"
const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const query = req.query
  const { id } = query
  const genSalt = () => {
    const S = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from(crypto.randomFillSync(new Uint32Array(24)))
      .map((v) => S[v % S.length])
      .join('');
  }
  switch (method) {
    case 'GET':
      if (!id) {
        res.status(400).json({ error: "Provide User ID" })
      }
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          profile_picture: true,
          mattars: true,
          createdAt: true
        },
      })
      res.status(200).json(user)
      break

    case 'POST':
      const pepper = process.env.PEPPER
      const salt = genSalt()
      const hash = await argon2.hash(pepper + req.body.password + salt)
      req.body.hash = hash
      req.body.salt = salt
      req.body.verified = false
      delete req.body.password
      const newUser = await prisma.user.create({
        data: req.body,
      })
      res.status(200).json(newUser)
      break

    case 'DELETE':
      if (!id) {
        res.status(400).json({ error: "Provide User ID" })
      }
      const deleteUser = await prisma.user.delete({
        where: {
          id: id
        },
      })
      res.status(200).json(deleteUser)
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}