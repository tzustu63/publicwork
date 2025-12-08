import 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: Role
    officeId: string
    officeName: string
  }

  interface Session {
    user: User & {
      id: string
      role: string
      officeId: string
      officeName: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    officeId: string
    officeName: string
  }
}


