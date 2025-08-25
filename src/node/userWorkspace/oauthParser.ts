import { logger, field } from "@coder/logger"
import { UserInfo } from "./types"

/**
 * OAuth 用户信息解析器
 * 负责从 HTTP 请求头中解析 OAuth 代理传递的用户信息
 */
export class OAuthUserParser {
  /**
   * 从请求头中解析 OAuth 用户信息
   */
  static parseUserFromHeaders(req: any): UserInfo | null {
    const email = req.headers["x-forwarded-email"] as string
    const preferredUsername = req.headers["x-forwarded-preferred-username"] as string

    // 添加基本日志，查看实际接收到的头信息
    logger.info("Raw OAuth headers", field("headers", {
      email: req.headers["x-forwarded-email"],
      preferredUsername: req.headers["x-forwarded-preferred-username"]
    }))

    if (!email) {
      logger.debug(
        "Missing required OAuth headers",
        field("email", !!email),
        field(
          "headers",
          Object.keys(req.headers).filter((h) => h.startsWith("x-forwarded-")),
        ),
      )
      return null
    }

    // 从 email 中提取 username（@ 符号前的部分）
    const username = email.split('@')[0]

    const userInfo: UserInfo = {
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      preferredUsername: preferredUsername?.toLowerCase().trim(),
    }

    logger.debug(
      "Parsed OAuth user info",
      field("email", userInfo.email),
      field("username", userInfo.username),
    )

    return userInfo
  }

  /**
   * 验证用户信息是否完整和有效
   */
  static validateUserInfo(userInfo: UserInfo): boolean {
    if (!userInfo.email || !userInfo.username) {
      return false
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userInfo.email)) {
      logger.warn("Invalid email format", field("email", userInfo.email))
      return false
    }

    // 验证用户名格式（只允许字母、数字、下划线、连字符）
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(userInfo.username)) {
      logger.warn("Invalid username format", field("username", userInfo.username))
      return false
    }

    return true
  }

  /**
   * 清理和标准化用户信息
   */
  static sanitizeUserInfo(userInfo: UserInfo): UserInfo {
    return {
      email: userInfo.email.toLowerCase().trim(),
      username: userInfo.username
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "_"),
      preferredUsername: userInfo.preferredUsername
        ?.toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "_"),
    }
  }
}
