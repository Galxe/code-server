import { Request, Response, NextFunction } from "express"
import { AuthType, DefaultedArgs } from "../../../../src/node/cli"
import { UserWorkspaceManager } from "../../../../src/node/userWorkspace/manager"
import { userWorkspaceMiddleware, userWorkspaceInfoMiddleware } from "../../../../src/node/userWorkspace/middleware"

// Mock UserWorkspaceManager
jest.mock("../../../../src/node/userWorkspace/manager")

describe("userWorkspaceMiddleware", () => {
  let mockManager: jest.Mocked<UserWorkspaceManager>
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockManager = {
      ensureUserWorkspace: jest.fn(),
      updateLastAccessed: jest.fn(),
      getStats: jest.fn(),
      dispose: jest.fn(),
    } as any

    mockReq = {
      args: { auth: AuthType.None } as DefaultedArgs,
      headers: {},
    }

    mockRes = {}
    mockNext = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should process OAuth headers and create user workspace", async () => {
    const middleware = userWorkspaceMiddleware(mockManager)

    mockReq.headers = {
      "x-forwarded-email": "test@example.com",
      "x-forwarded-user": "testuser",
      "x-forwarded-preferred-username": "Test User",
    }

    const mockWorkspace = {
      userId: "test123",
      workspacePath: "/test/path",
      workspaceType: "folder" as const,
      createdAt: new Date(),
      lastAccessed: new Date(),
    }

    mockManager.ensureUserWorkspace.mockResolvedValue(mockWorkspace)

    await middleware(mockReq as Request, mockRes as Response, mockNext)

    expect(mockManager.ensureUserWorkspace).toHaveBeenCalledWith({
      email: "test@example.com",
      username: "testuser",
      preferredUsername: "test user",
      groups: undefined,
    })

    expect((mockReq as any).userWorkspace).toEqual(mockWorkspace)
    expect((mockReq as any).userInfo).toEqual({
      email: "test@example.com",
      username: "testuser",
      preferredUsername: "test user",
      groups: undefined,
    })

    expect(mockNext).toHaveBeenCalled()
  })

  it("should skip processing for non-OAuth auth", async () => {
    const middleware = userWorkspaceMiddleware(mockManager)

    mockReq.args = { auth: AuthType.Password } as DefaultedArgs
    mockReq.headers = {
      "x-forwarded-email": "test@example.com",
      "x-forwarded-user": "testuser",
    }

    await middleware(mockReq as Request, mockRes as Response, mockNext)

    expect(mockManager.ensureUserWorkspace).not.toHaveBeenCalled()
    expect((mockReq as any).userWorkspace).toBeUndefined()
    expect(mockNext).toHaveBeenCalled()
  })

  it("should skip processing for invalid OAuth headers", async () => {
    const middleware = userWorkspaceMiddleware(mockManager)

    mockReq.headers = {
      "x-forwarded-email": "test@example.com",
      // missing x-forwarded-user
    }

    await middleware(mockReq as Request, mockRes as Response, mockNext)

    expect(mockManager.ensureUserWorkspace).not.toHaveBeenCalled()
    expect((mockReq as any).userWorkspace).toBeUndefined()
    expect(mockNext).toHaveBeenCalled()
  })

  it("should continue processing even if workspace creation fails", async () => {
    const middleware = userWorkspaceMiddleware(mockManager)

    mockReq.headers = {
      "x-forwarded-email": "test@example.com",
      "x-forwarded-user": "testuser",
    }

    mockManager.ensureUserWorkspace.mockRejectedValue(new Error("Workspace creation failed"))

    await middleware(mockReq as Request, mockRes as Response, mockNext)

    expect(mockManager.ensureUserWorkspace).toHaveBeenCalled()
    expect((mockReq as any).userWorkspace).toBeUndefined()
    expect(mockNext).toHaveBeenCalled()
  })

  it("should handle middleware errors", async () => {
    const middleware = userWorkspaceMiddleware(mockManager)

    // 模拟中间件内部错误
    mockReq.args = null as any

    await middleware(mockReq as Request, mockRes as Response, mockNext)

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
  })
})

describe("userWorkspaceInfoMiddleware", () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockReq = {}
    mockRes = {}
    mockNext = jest.fn()
  })

  it("should add helper methods to request", () => {
    const middleware = userWorkspaceInfoMiddleware()

    middleware(mockReq as Request, mockRes as Response, mockNext)

    expect((mockReq as any).getUserWorkspace).toBeInstanceOf(Function)
    expect((mockReq as any).getUserInfo).toBeInstanceOf(Function)
    expect((mockReq as any).hasUserWorkspace).toBeInstanceOf(Function)
    expect(mockNext).toHaveBeenCalled()
  })

  it("should return correct values from helper methods", () => {
    const middleware = userWorkspaceInfoMiddleware()

    const mockWorkspace = {
      userId: "test123",
      workspacePath: "/test/path",
      workspaceType: "folder" as const,
      createdAt: new Date(),
      lastAccessed: new Date(),
    }

    const mockUserInfo = {
      email: "test@example.com",
      username: "testuser",
    }

    ;(mockReq as any).userWorkspace = mockWorkspace
    ;(mockReq as any).userInfo = mockUserInfo

    middleware(mockReq as Request, mockRes as Response, mockNext)

    expect((mockReq as any).getUserWorkspace()).toBe(mockWorkspace)
    expect((mockReq as any).getUserInfo()).toBe(mockUserInfo)
    expect((mockReq as any).hasUserWorkspace()).toBe(true)
  })

  it("should return undefined/false when no workspace is set", () => {
    const middleware = userWorkspaceInfoMiddleware()

    middleware(mockReq as Request, mockRes as Response, mockNext)

    expect((mockReq as any).getUserWorkspace()).toBeUndefined()
    expect((mockReq as any).getUserInfo()).toBeUndefined()
    expect((mockReq as any).hasUserWorkspace()).toBe(false)
  })
})
