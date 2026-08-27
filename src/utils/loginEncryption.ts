function pemToArrayBuffer(publicKeyPem: string): ArrayBuffer {
  const base64 = publicKeyPem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '')

  if (!base64) throw new Error('登录公钥内容为空')

  try {
    const binary = atob(base64)
    return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer
  } catch {
    throw new Error('登录公钥格式无效')
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

export async function encryptLoginCredential(
  credential: string,
  publicKeyPem: string,
): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error('当前浏览器不支持安全登录加密')

  try {
    const publicKey = await crypto.subtle.importKey(
      'spki',
      pemToArrayBuffer(publicKeyPem),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt'],
    )
    const encrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      new TextEncoder().encode(credential),
    )
    return arrayBufferToBase64(encrypted)
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('登录公钥')) throw error
    throw new Error('登录凭证加密失败，请刷新页面后重试', { cause: error })
  }
}
