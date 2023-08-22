declare module "next-auth" {
  interface User {
    admin: Boolean
    id: string
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}