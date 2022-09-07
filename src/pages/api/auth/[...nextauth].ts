import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import argon2 from "argon2"
import prisma from "lib/prisma"
import type { Session, User } from "next-auth"

const findUserByCredentials = async (credentials: Record<"username" | "password", string> | undefined) => {
  if (credentials?.username && credentials.password) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: credentials.username
        },
      })
      if (user) {
        const pepper = process.env.PEPPER
        if (await argon2.verify(user.hash, pepper + credentials?.password + user.salt)) {
          return user
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  return null
}

export default NextAuth({
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
    async session({ session, token, user }) {
      const userInfo = await prisma.user.findUnique({
        where: {
          email: session.user.email
        },
      })
      session.user.id = userInfo.id
      return session
    },
  },
  pages: {
    signIn: '/signin',
    newUser: '/' // New users will be directed here on first sign in (leave the property out if not of interest)
  }
})