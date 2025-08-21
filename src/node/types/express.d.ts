/**
 * Express 类型扩展
 * 为用户工作区功能添加类型支持
 */

import { UserWorkspace, UserInfo } from "../userWorkspace/types"

declare namespace Express {
  interface Request {
    // 现有扩展
    args: any
    heart: any
    settings: any
    updater: any

    // 用户工作区扩展
    userWorkspace?: UserWorkspace
    userInfo?: UserInfo

    // 辅助方法
    getUserWorkspace(): UserWorkspace | undefined
    getUserInfo(): UserInfo | undefined
    hasUserWorkspace(): boolean
  }
}
