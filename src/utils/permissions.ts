const PERMISSION_ALIASES: Record<string, string[]> = {
  'user.create': ['user.create', 'users.create', 'user:create', 'users:create', 'USER_CREATE'],
  'user.delete': ['user.delete', 'users.delete', 'user:delete', 'users:delete', 'USER_DELETE'],
  'user.ban': ['user.ban', 'users.ban', 'user:ban', 'users:ban', 'USER_BAN'],
  'user.role': [
    'user.role',
    'users.role',
    'user:role',
    'users:role',
    'user.assign-role',
    'USER_ROLE',
    'USER_ASSIGN_ROLE',
  ],
  'user.permission': [
    'user.permission',
    'users.permission',
    'user:permission',
    'users:permission',
    'USER_PERMISSION',
  ],
}

export type UserActionPermission =
  | 'user.create'
  | 'user.delete'
  | 'user.ban'
  | 'user.role'
  | 'user.permission'

function normalizePermission(value: string): string {
  return value.trim().toLowerCase().replace(/:/g, '.').replace(/_/g, '.')
}

export function hasPermissionCode(owned: string[] | undefined, required: UserActionPermission): boolean {
  if (!owned?.length) return false
  const wanted = new Set((PERMISSION_ALIASES[required] || [required]).map(normalizePermission))
  const need = normalizePermission(required)

  return owned.some((item) => {
    const code = normalizePermission(item)
    if (!code) return false
    if (code === '*' || code === '*.*' || code === 'admin' || code === 'user.*' || code === 'users.*') {
      return true
    }
    if (wanted.has(code) || code === need) return true
    if (code.endsWith('.*') && need.startsWith(code.slice(0, -1))) return true
    return false
  })
}
