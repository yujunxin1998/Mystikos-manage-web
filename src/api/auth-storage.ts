export const ACCESS_TOKEN_KEY = 'mystikos_admin_access_token'
export const REFRESH_TOKEN_KEY = 'mystikos_admin_refresh_token'
export const USER_KEY = 'mystikos_admin_user'

export function getStoredValue(key: string): string {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

export function storeAuthValue(key: string, value: string, remember: boolean): void {
  const target = remember ? localStorage : sessionStorage
  const other = remember ? sessionStorage : localStorage
  other.removeItem(key)
  target.setItem(key, value)
}

export function clearStoredAuth(): void {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(ACCESS_TOKEN_KEY)
    storage.removeItem(REFRESH_TOKEN_KEY)
    storage.removeItem(USER_KEY)
  }
}
