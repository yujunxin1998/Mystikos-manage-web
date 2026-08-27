/**
 * 应用级开关配置。
 *
 * 登录加密开关需与后端保持一致：后端未启用登录加密时，前端也必须关闭，
 * 否则登录会被拒绝（详见登录说明）。
 */
export const appConfig = {
  /** 登录密码是否启用 RSA 非对称加密；设为 false 时直接提交明文密码 */
  loginEncryptionEnabled: true,
}
