import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from './http'
import { deleteFile, getFileUrl, uploadFile } from './files'

vi.mock('./http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('files api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('以 multipart 上传文件并解包 objectKey', async () => {
    vi.mocked(http.post).mockResolvedValue({
      data: {
        code: 200,
        message: 'ok',
        data: { objectKey: 'products/1/main.png', url: 'https://x/presigned' },
      },
    })

    const file = new File(['x'], 'main.png', { type: 'image/png' })
    const result = await uploadFile(file)

    expect(http.post).toHaveBeenCalledWith('/api/v1/files/upload', expect.any(FormData))
    expect(result.objectKey).toBe('products/1/main.png')
  })

  it('按 objectKey 获取预签名 URL', async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: { code: 200, message: 'ok', data: 'https://x/presigned' },
    })

    await expect(getFileUrl('products/1/main.png')).resolves.toBe('https://x/presigned')
    expect(http.get).toHaveBeenCalledWith('/api/v1/files/url', {
      params: { objectKey: 'products/1/main.png' },
    })
  })

  it('按 objectKey 删除文件', async () => {
    vi.mocked(http.delete).mockResolvedValue({ data: { code: 200, message: 'ok', data: null } })

    await deleteFile('products/1/main.png')
    expect(http.delete).toHaveBeenCalledWith('/api/v1/files', {
      params: { objectKey: 'products/1/main.png' },
    })
  })
})
