import { promises as fs } from "fs"
import * as os from "os"
import * as path from "path"
import { UserWorkspaceManager } from "../../../../src/node/userWorkspace/manager"
import { UserInfo, WorkspaceConfig } from "../../../../src/node/userWorkspace/types"

describe("UserWorkspaceManager", () => {
  let tempDir: string
  let config: WorkspaceConfig
  let manager: UserWorkspaceManager

  beforeEach(async () => {
    // 创建临时目录
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "code-server-test-"))

    config = {
      baseWorkspaceDir: tempDir,
      userWorkspaceSubDir: "users",
      defaultWorkspaceType: "folder",
      createWorkspaceFile: false,
    }

    manager = new UserWorkspaceManager(config)
  })

  afterEach(async () => {
    // 清理临时目录
    manager.dispose()
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      // 忽略清理错误
    }
  })

  describe("ensureUserWorkspace", () => {
    it("should create new user workspace", async () => {
      const userInfo: UserInfo = {
        email: "test@example.com",
        username: "testuser",
        preferredUsername: "Test User",
      }

      const result = await manager.ensureUserWorkspace(userInfo)

      expect(result.userId).toBeDefined()
      expect(result.workspacePath).toContain(tempDir)
      expect(result.workspaceType).toBe("folder")
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.lastAccessed).toBeInstanceOf(Date)

      // 验证目录已创建
      const workspaceExists = await fs
        .access(result.workspacePath)
        .then(() => true)
        .catch(() => false)
      expect(workspaceExists).toBe(true)

      // 验证 .gitkeep 文件存在
      const gitkeepExists = await fs
        .access(path.join(result.workspacePath, ".gitkeep"))
        .then(() => true)
        .catch(() => false)
      expect(gitkeepExists).toBe(true)

      // 验证用户信息文件存在
      const userInfoExists = await fs
        .access(path.join(result.workspacePath, ".user-info.json"))
        .then(() => true)
        .catch(() => false)
      expect(userInfoExists).toBe(true)
    })

    it("should return existing workspace for same user", async () => {
      const userInfo: UserInfo = {
        email: "test@example.com",
        username: "testuser",
      }

      const result1 = await manager.ensureUserWorkspace(userInfo)
      const result2 = await manager.ensureUserWorkspace(userInfo)

      expect(result1.userId).toBe(result2.userId)
      expect(result1.workspacePath).toBe(result2.workspacePath)
      expect(result2.lastAccessed.getTime()).toBeGreaterThanOrEqual(result1.lastAccessed.getTime())
    })

    it("should create workspace file when configured", async () => {
      config.createWorkspaceFile = true
      config.defaultWorkspaceType = "workspace"
      manager = new UserWorkspaceManager(config)

      const userInfo: UserInfo = {
        email: "test@example.com",
        username: "testuser",
        preferredUsername: "Test User",
      }

      const result = await manager.ensureUserWorkspace(userInfo)

      expect(result.workspaceType).toBe("workspace")
      expect(result.workspacePath).toMatch(/\.code-workspace$/)

      // 验证工作区文件存在
      const workspaceFileExists = await fs
        .access(result.workspacePath)
        .then(() => true)
        .catch(() => false)
      expect(workspaceFileExists).toBe(true)

      // 验证工作区文件内容
      const workspaceContent = await fs.readFile(result.workspacePath, "utf8")
      const workspaceData = JSON.parse(workspaceContent)

      expect(workspaceData.folders).toBeDefined()
      expect(workspaceData.folders[0].name).toBe("test_user")
      expect(workspaceData.settings).toBeDefined()
    })

    it("should generate consistent user ID for same email", async () => {
      const userInfo1: UserInfo = {
        email: "test@example.com",
        username: "testuser1",
      }

      const userInfo2: UserInfo = {
        email: "test@example.com",
        username: "testuser2", // different username, same email
      }

      const result1 = await manager.ensureUserWorkspace(userInfo1)
      const result2 = await manager.ensureUserWorkspace(userInfo2)

      expect(result1.userId).toBe(result2.userId)
    })

    it("should generate different user ID for different emails", async () => {
      const userInfo1: UserInfo = {
        email: "test1@example.com",
        username: "testuser",
      }

      const userInfo2: UserInfo = {
        email: "test2@example.com",
        username: "testuser",
      }

      const result1 = await manager.ensureUserWorkspace(userInfo1)
      const result2 = await manager.ensureUserWorkspace(userInfo2)

      expect(result1.userId).not.toBe(result2.userId)
    })

    it("should reject invalid user info", async () => {
      const invalidUserInfo: UserInfo = {
        email: "invalid-email",
        username: "testuser",
      }

      await expect(manager.ensureUserWorkspace(invalidUserInfo)).rejects.toThrow("Invalid user information")
    })
  })

  describe("getStats", () => {
    it("should return workspace statistics", async () => {
      const userInfo1: UserInfo = {
        email: "test1@example.com",
        username: "testuser1",
      }

      const userInfo2: UserInfo = {
        email: "test2@example.com",
        username: "testuser2",
      }

      await manager.ensureUserWorkspace(userInfo1)
      await manager.ensureUserWorkspace(userInfo2)

      const stats = await manager.getStats()

      expect(stats.totalUsers).toBe(2)
      expect(stats.totalWorkspaces).toBe(2)
      expect(stats.diskUsage).toBeGreaterThan(0)
      expect(stats.lastUpdated).toBeInstanceOf(Date)
    })
  })

  describe("updateLastAccessed", () => {
    it("should update last accessed time", async () => {
      const userInfo: UserInfo = {
        email: "test@example.com",
        username: "testuser",
      }

      const workspace = await manager.ensureUserWorkspace(userInfo)
      const originalTime = workspace.lastAccessed

      // 等待一毫秒确保时间不同
      await new Promise((resolve) => setTimeout(resolve, 1))

      await manager.updateLastAccessed(workspace.userId)

      expect(workspace.lastAccessed.getTime()).toBeGreaterThan(originalTime.getTime())

      // 验证用户信息文件也被更新
      const userInfoPath = path.join(workspace.workspacePath, ".user-info.json")
      const userInfoContent = await fs.readFile(userInfoPath, "utf8")
      const userInfoData = JSON.parse(userInfoContent)

      expect(new Date(userInfoData.lastUpdated).getTime()).toBeGreaterThan(originalTime.getTime())
    })
  })
})
