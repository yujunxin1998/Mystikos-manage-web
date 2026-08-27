import type { UserRole } from '../types'

export const ROLE_LABELS: Record<UserRole, string> = {
  GUEST: '访客',
  MEMBER: '会员',
  COMPANION: '陪玩师',
  CUSTOMER_SERVICE: '客服',
  ASSESSOR: '考核员',
  ADMIN: '管理员',
}

export function formatRoleLabels(roles: UserRole[] | undefined | null): string {
  if (!roles?.length) return ''
  return roles.map((role) => ROLE_LABELS[role] || role).join(' / ')
}

export function avatarInitial(displayName: string | undefined | null): string {
  const text = displayName?.trim()
  if (!text) return '管'
  return Array.from(text)[0] || '管'
}

export function resolveDisplayName(options: {
  nickname?: string | null
  phone?: string | null
  email?: string | null
  userId: number
}): string {
  const nickname = options.nickname?.trim()
  if (nickname) return nickname
  const phone = options.phone?.trim()
  if (phone) return phone
  const email = options.email?.trim()
  if (email) return email
  return `用户 #${options.userId}`
}
