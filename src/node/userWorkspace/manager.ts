import { logger, field } from "@coder/logger"
import { promises as fs } from "fs"
import * as path from "path"
import { OAuthUserParser } from "./oauthParser"
import { UserInfo, UserWorkspace, WorkspaceConfig, WorkspaceStats } from "./types"

/**
 * 用户工作区管理器
 * 负责创建、管理和维护用户特定的工作区
 */
export class UserWorkspaceManager {
  private config: WorkspaceConfig
  private workspaces: Map<string, UserWorkspace> = new Map()
  private stats: WorkspaceStats

  constructor(config: WorkspaceConfig) {
    this.config = config
    this.stats = {
      totalUsers: 0,
      totalWorkspaces: 0,
      diskUsage: 0,
      lastUpdated: new Date(),
    }
  }

  /**
   * Ensure user workspace exists, create if not
   */
  async ensureUserWorkspace(userInfo: UserInfo): Promise<UserWorkspace> {
    const sanitizedUserInfo = OAuthUserParser.sanitizeUserInfo(userInfo)

    if (!OAuthUserParser.validateUserInfo(sanitizedUserInfo)) {
      throw new Error("Invalid user information")
    }

    const userId = this.generateUserId(sanitizedUserInfo)

    try {
      // Check if workspace already exists
      if (this.workspaces.has(userId)) {
        const existing = this.workspaces.get(userId)!
        existing.lastAccessed = new Date()
        await this.updateLastAccessed(userId)
        return existing
      }
      // Create new user workspace
      const workspacePath = await this.createUserWorkspace(userId, sanitizedUserInfo)

      const userWorkspace: UserWorkspace = {
        userId,
        workspacePath,
        workspaceType: this.config.defaultWorkspaceType,
        createdAt: new Date(),
        lastAccessed: new Date(),
      }

      this.workspaces.set(userId, userWorkspace)
      await this.updateStats()

      return userWorkspace
    } catch (error) {
      logger.error("Failed to ensure user workspace", field("userId", userId), field("error", error))
      throw error
    }
  }

  /**
   * Create user workspace
   */
  private async createUserWorkspace(userId: string, userInfo: UserInfo): Promise<string> {
    const userWorkspaceDir = path.join(this.config.baseWorkspaceDir, this.config.userWorkspaceSubDir, userId)

    try {
      // Ensure base directory exists
      await fs.mkdir(userWorkspaceDir, { recursive: true })

      // Set directory permissions
      await fs.chmod(userWorkspaceDir, 0o755)

      // Create .gitkeep file
      await fs.writeFile(path.join(userWorkspaceDir, ".gitkeep"), "")

      // Create user info file
      await this.createUserInfoFile(userWorkspaceDir, userInfo)

      // Create VS Code settings for terminal integration
      await this.createVSCodeSettings(userWorkspaceDir, userInfo)

      // If configured to create workspace file
      if (this.config.createWorkspaceFile) {
        const workspaceFilePath = path.join(userWorkspaceDir, `${userId}.code-workspace`)
        if (!(await this.pathExists(workspaceFilePath))) {
          await this.createWorkspaceFile(workspaceFilePath, userInfo)
        }
        return workspaceFilePath
      }

      return userWorkspaceDir
    } catch (error) {
      logger.error(
        "Failed to create user workspace",
        field("userId", userId),
        field("workspacePath", userWorkspaceDir),
        field("error", error),
      )
      throw error
    }
  }

  /**
   * 创建工作区文件
   */
  private async createWorkspaceFile(workspaceFilePath: string, userInfo: UserInfo): Promise<void> {
    // 获取工作区目录路径
    const workspaceDir = path.dirname(workspaceFilePath)

    const workspaceConfig = {
      folders: [
        {
          name: userInfo.preferredUsername || userInfo.username,
          path: workspaceDir,
        },
      ],
      settings: {
        "files.exclude": {
          "**/.git": true,
          "**/.DS_Store": true,
          "**/node_modules": true,
          "**/.vscode": false,
        },
        "explorer.sortOrder": "type",
        "files.autoSave": "afterDelay",
        "files.autoSaveDelay": 1000,
        "terminal.integrated.cwd": "${workspaceFolder}",
        "terminal.integrated.defaultProfile.osx": "zsh",
        "terminal.integrated.defaultProfile.linux": "bash",
        "terminal.integrated.defaultProfile.windows": "PowerShell",
      },
      extensions: {
        recommendations: [],
      },
    }

    await fs.writeFile(workspaceFilePath, JSON.stringify(workspaceConfig, null, 2))
  }

  /**
   * 创建用户信息文件
   */
  private async createUserInfoFile(workspaceDir: string, userInfo: UserInfo): Promise<void> {
    const userInfoPath = path.join(workspaceDir, ".user-info.json")
    const userInfoData = {
      ...userInfo,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }

    await fs.writeFile(userInfoPath, JSON.stringify(userInfoData, null, 2))
  }

  /**
   * 生成用户ID
   */
  private generateUserId(userInfo: UserInfo): string {
    // 使用用户名作为目录名，更直观易识别
    // 清理用户名，移除特殊字符，只保留字母、数字、下划线、连字符
    const cleanUsername = userInfo.username.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase()

    // 如果清理后的用户名为空，则使用邮箱前缀
    if (!cleanUsername) {
      const emailPrefix = userInfo.email.split("@")[0]
      return emailPrefix.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase()
    }

    return cleanUsername
  }

  /**
   * 更新最后访问时间
   */
  async updateLastAccessed(userId: string): Promise<void> {
    const workspace = this.workspaces.get(userId)
    if (workspace) {
      workspace.lastAccessed = new Date()

      // 更新磁盘上的用户信息文件
      try {
        let userInfoPath: string
        if (workspace.workspaceType === "workspace") {
          // 工作区文件模式，用户信息文件在同一目录
          userInfoPath = path.join(path.dirname(workspace.workspacePath), ".user-info.json")
        } else {
          // 文件夹模式，用户信息文件在工作区目录内
          userInfoPath = path.join(workspace.workspacePath, ".user-info.json")
        }

        if (await this.pathExists(userInfoPath)) {
          const userInfo = JSON.parse(await fs.readFile(userInfoPath, "utf8"))
          userInfo.lastUpdated = new Date().toISOString()
          await fs.writeFile(userInfoPath, JSON.stringify(userInfo, null, 2))
        }
      } catch (error) {
        logger.warn("Failed to update user info file", field("userId", userId), field("error", error))
      }
    }
  }

  /**
   * 获取工作区统计信息
   */
  async getStats(): Promise<WorkspaceStats> {
    await this.updateStats()
    return { ...this.stats }
  }

  /**
   * 更新统计信息
   */
  private async updateStats(): Promise<void> {
    try {
      const usersDir = path.join(this.config.baseWorkspaceDir, this.config.userWorkspaceSubDir)

      if (await this.pathExists(usersDir)) {
        const entries = await fs.readdir(usersDir, { withFileTypes: true })
        const directories = entries.filter((entry) => entry.isDirectory())

        this.stats.totalUsers = directories.length
        this.stats.totalWorkspaces = this.workspaces.size
        this.stats.lastUpdated = new Date()

        // 计算磁盘使用量（简化版本）
        let totalSize = 0
        for (const dir of directories) {
          try {
            const dirPath = path.join(usersDir, dir.name)
            totalSize += await this.calculateDirectorySize(dirPath)
          } catch (error) {
            // Ignore directory size calculation errors
          }
        }

        this.stats.diskUsage = totalSize
      }
    } catch (error) {
      logger.warn("Failed to update workspace stats", field("error", error))
    }
  }

  /**
   * 计算目录大小
   */
  private async calculateDirectorySize(dirPath: string): Promise<number> {
    try {
      const stat = await fs.stat(dirPath)
      if (!stat.isDirectory()) {
        return stat.size
      }

      const entries = await fs.readdir(dirPath)
      let totalSize = 0

      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry)
        try {
          const entryStat = await fs.stat(entryPath)
          if (entryStat.isDirectory()) {
            totalSize += await this.calculateDirectorySize(entryPath)
          } else {
            totalSize += entryStat.size
          }
        } catch (error) {
          // 忽略无法访问的文件
        }
      }

      return totalSize
    } catch (error) {
      return 0
    }
  }

  /**
   * 检查路径是否存在
   */
  private async pathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path)
      return true
    } catch {
      return false
    }
  }

  /**
   * 创建 VS Code 设置文件，配置终端集成
   */
  private async createVSCodeSettings(workspaceDir: string, userInfo: UserInfo): Promise<void> {
    try {
      const vscodeDir = path.join(workspaceDir, ".vscode")
      await fs.mkdir(vscodeDir, { recursive: true })

      const settingsPath = path.join(vscodeDir, "settings.json")
      const settings = {
        "terminal.integrated.cwd": "${workspaceFolder}",
        "terminal.integrated.defaultProfile.osx": "zsh",
        "terminal.integrated.defaultProfile.linux": "bash",
        "terminal.integrated.defaultProfile.windows": "PowerShell",
        "terminal.integrated.shell.osx": "/bin/zsh",
        "terminal.integrated.shell.linux": "/bin/bash",
        "terminal.integrated.shell.windows": "C:\\Windows\\System32\\PowerShell.exe",
        "files.exclude": {
          "**/.git": true,
          "**/.DS_Store": true,
          "**/node_modules": true,
          "**/.vscode": false,
        },
        "explorer.sortOrder": "type",
        "files.autoSave": "afterDelay",
        "files.autoSaveDelay": 1000,
      }

      await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))
    } catch (error) {
      logger.warn("Failed to create VS Code settings", field("workspaceDir", workspaceDir), field("error", error))
    }
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.workspaces.clear()
  }
}
