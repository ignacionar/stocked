/* ======================================================
   ENUMS
   ====================================================== */

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER'
} as const

export type Role = (typeof Role)[keyof typeof Role]


export const Plan = {
  BASIC: 'BASIC',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE'
} as const

export type Plan = (typeof Plan)[keyof typeof Plan]


export const JobStatus = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  INVALID: 'INVALID'
} as const

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus]

/* ======================================================
   BASE ENTITIES
   ====================================================== */

export type Commerce = {
  id: string
  name: string
  location: string
  createdAt: Date
  updatedAt: Date
}

export type User = {
  occupation: string
  id: string
  name: string
  email: string
  emailVerified?: boolean | null
  image?: string | null
  role: Role
  plan: Plan
  createdAt: Date
  updatedAt: Date
}

export type Stock = {
  id: string
  name: string
  price: number
  quantity: number
  measure: string
  supplier: string
  commerceId: string
  createdAt: Date
  updatedAt: Date
}

export type InvoiceJob = {
  id: string
  status: JobStatus
  commerceId: string
  createdAt: Date
  updatedAt: Date
  filesCount: number
  response: string | null
  error: string | null
}

/* ======================================================
   RELATIONS
   ====================================================== */

export type UserCommerce = {
  userId: string
  commerceId: string
}

export type UserWithCommerces = User & {
  commerces: Commerce[]
}

/* ======================================================
   AUTH RELATED
   ====================================================== */

export type Session = {
  user: User 
  id: string
  expiresAt: Date
  token: string
  createdAt: Date
  updatedAt: Date
  ipAddress?: string | null
  userAgent?: string | null
  userId: string
}

export type Account = {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: Date | null
  refreshTokenExpiresAt?: Date | null
  scope?: string | null
  password?: string | null
  createdAt: Date
  updatedAt: Date
}