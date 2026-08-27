export type LoginChannel = 'PHONE' | 'EMAIL'
export type UserRole = 'GUEST' | 'MEMBER' | 'COMPANION' | 'CUSTOMER_SERVICE' | 'ASSESSOR' | 'ADMIN'

export interface AuthUser {
  id: number
  displayName: string
  roles: UserRole[]
  avatar: string
  nickname?: string
  phone?: string
  email?: string
  avatarUrl?: string
}

export interface LoginForm {
  channel: LoginChannel
  identifier: string
  password: string
  remember: boolean
}

export interface LoginRequest {
  channel: LoginChannel
  identifier: string
  credentialType: 'PASSWORD'
  credential?: string
  keyId?: string
  encryptedCredential?: string
}

export interface LoginPublicKeyResponse {
  keyId: string
  algorithm: 'RSA-OAEP-256'
  publicKey: string
}

export interface AuthTokenResponse {
  accessToken: string
  refreshToken: string
  userId: number
}

export interface CurrentUserResponse {
  userId: number
  roles: UserRole[]
  status: 'ACTIVE' | 'DISABLED' | 'BANNED' | 'DELETED'
}
