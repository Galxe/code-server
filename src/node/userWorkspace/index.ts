/**
 * 用户工作区管理模块
 * 提供 OAuth 模式下的用户工作区自动创建和管理功能
 */

export * from "./types"
export * from "./manager"
export * from "./oauthParser"
export * from "./middleware"

// 默认导出管理器类
export { UserWorkspaceManager as default } from "./manager"
