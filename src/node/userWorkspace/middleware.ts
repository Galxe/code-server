import { logger, field } from "@coder/logger"
import { Request, Response, NextFunction } from "express"
import { AuthType } from "../cli"
import { UserWorkspaceManager } from "./manager"
import { OAuthUserParser } from "./oauthParser"

// Simple in-memory session storage (for production, use Redis etc.)
const userSessions = new Map<string, { userInfo: any; userWorkspace: any; lastAccess: number }>()

/**
 * User workspace middleware
 * Responsible for parsing user information and ensuring user workspace exists in OAuth mode
 */
export const userWorkspaceMiddleware = (workspaceManager: UserWorkspaceManager) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only process in OAuth mode
      if (req.args.auth === AuthType.None) {
        let userInfo = OAuthUserParser.parseUserFromHeaders(req)
        let userWorkspace = null

        // If no OAuth headers, try to restore from session
        if (!userInfo) {
          // Check for existing workspace query parameters
          const folder = req.query.folder as string
          const workspace = req.query.workspace as string

          if (folder || workspace) {
            // Extract user ID from path
            const path = folder || workspace
            if (path && path.includes("/workspaces/users/")) {
              const userIdMatch = path.match(/\/workspaces\/users\/([^/]+)/)
              if (userIdMatch) {
                const userId = userIdMatch[1]
                const session = userSessions.get(userId)

                if (session && Date.now() - session.lastAccess < 30 * 60 * 1000) {
                  // 30 minutes expiry
                  userInfo = session.userInfo
                  userWorkspace = session.userWorkspace
                  session.lastAccess = Date.now()
                }
              }
            }
          }
        }

        if (userInfo && OAuthUserParser.validateUserInfo(userInfo)) {
          try {
            // Ensure user workspace exists
            userWorkspace = await workspaceManager.ensureUserWorkspace(userInfo)

            // Attach user workspace info to request object
            ;(req as any).userWorkspace = userWorkspace
            ;(req as any).userInfo = userInfo

            // Save to session
            userSessions.set(userWorkspace.userId, {
              userInfo,
              userWorkspace,
              lastAccess: Date.now(),
            })
          } catch (error) {
            logger.error(
              "Failed to ensure user workspace",
              field("userInfo", { email: userInfo.email, username: userInfo.username }),
              field("error", error),
            )
            // Continue processing, do not block request
          }
        }
      }

      next()
    } catch (error) {
      logger.error("User workspace middleware error", field("error", error))
      next(error)
    }
  }
}

/**
 * 用户工作区信息中间件
 * 为请求添加用户工作区相关的辅助方法
 */
export const userWorkspaceInfoMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 添加辅助方法到请求对象
    ;(req as any).getUserWorkspace = () => (req as any).userWorkspace
    ;(req as any).getUserInfo = () => (req as any).userInfo
    ;(req as any).hasUserWorkspace = () => !!(req as any).userWorkspace

    next()
  }
}

/**
 * 清理过期会话
 */
export const cleanupExpiredSessions = () => {
  const now = Date.now()
  const expiredTimeout = 30 * 60 * 1000 // 30分钟

  for (const [userId, session] of userSessions.entries()) {
    if (now - session.lastAccess > expiredTimeout) {
      userSessions.delete(userId)
    }
  }
}

// 定期清理过期会话
setInterval(cleanupExpiredSessions, 5 * 60 * 1000) // 每5分钟清理一次
