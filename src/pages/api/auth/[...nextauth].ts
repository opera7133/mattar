import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import argon2 from "argon2"
import prisma from "lib/prisma"
import { SignJWT } from 'jose'
import { setCookie } from 'cookies-next'
import { nanoid } from "nanoid"

const findUserByCredentials = async (credentials: Record<"username" | "password", string> | undefined) => {
  if (credentials?.username && credentials.password) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: credentials.username,
        },
        include: {
          apiCredentials: true
        }
      })
      if (user) {
        const pepper = process.env.PEPPER
        if (await argon2.verify(user.hash, pepper + credentials?.password + user.salt)) {
          return user
        } else {
          return null
        }
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }
  return null
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Username or Email",
      credentials: {
        username: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const user = findUserByCredentials(credentials)
        if (user) {
          return user
        }
        return null
      },
    })
  ],
  callbacks: {
    async session({ session, token, user }: any) {
      const userInfo = await prisma.user.findUnique({
        where: {
          email: session.user.email
        },
      })
      session.user.id = userInfo?.id
      session.user.admin = userInfo?.admin
      return session
    },
  },
  pages: {
    signIn: '/signin',
    newUser: '/'
  }
}

export default NextAuth(authOptions)
