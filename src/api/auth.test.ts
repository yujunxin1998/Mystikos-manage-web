import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { getLoginPublicKey } from './auth'

vi.mock('./http', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

describe('auth api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the complete login public key contract', async () => {
    const publicKey = {
      keyId: 'login-key-2026-08',
      algorithm: 'RSA-OAEP-256' as const,
      publicKey: '-----BEGIN PUBLIC KEY-----\nMIIB...\n-----END PUBLIC KEY-----',
    }
    vi.mocked(http.get).mockResolvedValue({
      data: { code: 200, message: 'ok', data: publicKey },
    })

    await expect(getLoginPublicKey()).resolves.toEqual(publicKey)
    expect(http.get).toHaveBeenCalledWith('/api/v1/auth/public-key')
  })
})
