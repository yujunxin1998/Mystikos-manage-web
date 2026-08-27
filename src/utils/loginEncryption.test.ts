import { describe, expect, it } from 'vitest'
import { encryptLoginCredential } from './loginEncryption'

function arrayBufferToPem(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const base64 = btoa(binary)
  const lines = base64.match(/.{1,64}/g)?.join('\n') ?? base64
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`
}

function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer
}

describe('login credential encryption', () => {
  it('encrypts a password with an X.509 PEM public key using RSA-OAEP-256', async () => {
    const keyPair = (await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    )) as CryptoKeyPair
    const publicKey = arrayBufferToPem(await crypto.subtle.exportKey('spki', keyPair.publicKey))

    const encrypted = await encryptLoginCredential('secret123', publicKey)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      keyPair.privateKey,
      base64ToArrayBuffer(encrypted),
    )

    expect(new TextDecoder().decode(decrypted)).toBe('secret123')
    expect(encrypted).not.toContain('secret123')
  })
})
