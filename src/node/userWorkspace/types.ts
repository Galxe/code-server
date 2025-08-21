/**
 * 用户工作区管理相关的类型定义
 */

export interface UserInfo {
  email: string
  username: string
  preferredUsername?: string
  groups?: string[]
}

export interface UserWorkspace {
  userId: string
  workspacePath: string
  workspaceType: "folder" | "workspace"
  createdAt: Date
  lastAccessed: Date
}

export interface WorkspaceConfig {
  baseWorkspaceDir: string
  userWorkspaceSubDir: string
  defaultWorkspaceType: "folder" | "workspace"
  createWorkspaceFile: boolean
  workspaceFileTemplate?: string
}

export interface WorkspaceStats {
  totalUsers: number
  totalWorkspaces: number
  diskUsage: number
  lastUpdated: Date
}
