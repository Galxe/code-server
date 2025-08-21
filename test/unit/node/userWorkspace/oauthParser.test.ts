import { OAuthUserParser } from "../../../../src/node/userWorkspace/oauthParser"
import { UserInfo } from "../../../../src/node/userWorkspace/types"

describe("OAuthUserParser", () => {
  describe("parseUserFromHeaders", () => {
    it("should parse valid OAuth headers", () => {
      const req = {
        headers: {
          "x-forwarded-email": "test@example.com",
          "x-forwarded-user": "testuser",
          "x-forwarded-preferred-username": "Test User",
          "x-forwarded-groups": "admin,dev",
        },
      }

      const result = OAuthUserParser.parseUserFromHeaders(req)

      expect(result).toEqual({
        email: "test@example.com",
        username: "testuser",
        preferredUsername: "test user",
        groups: ["admin", "dev"],
      })
    })

    it("should return null for missing required headers", () => {
      const req = {
        headers: {
          "x-forwarded-email": "test@example.com",
          // missing x-forwarded-user
        },
      }

      const result = OAuthUserParser.parseUserFromHeaders(req)
      expect(result).toBeNull()
    })

    it("should handle optional headers", () => {
      const req = {
        headers: {
          "x-forwarded-email": "test@example.com",
          "x-forwarded-user": "testuser",
          // no optional headers
        },
      }

      const result = OAuthUserParser.parseUserFromHeaders(req)

      expect(result).toEqual({
        email: "test@example.com",
        username: "testuser",
        preferredUsername: undefined,
        groups: undefined,
      })
    })

    it("should trim and lowercase values", () => {
      const req = {
        headers: {
          "x-forwarded-email": "  TEST@EXAMPLE.COM  ",
          "x-forwarded-user": "  TESTUSER  ",
        },
      }

      const result = OAuthUserParser.parseUserFromHeaders(req)

      expect(result).toEqual({
        email: "test@example.com",
        username: "testuser",
        preferredUsername: undefined,
        groups: undefined,
      })
    })

    it("should parse groups correctly", () => {
      const req = {
        headers: {
          "x-forwarded-email": "test@example.com",
          "x-forwarded-user": "testuser",
          "x-forwarded-groups": "admin, dev , users,  ",
        },
      }

      const result = OAuthUserParser.parseUserFromHeaders(req)
      expect(result?.groups).toEqual(["admin", "dev", "users"])
    })
  })

  describe("validateUserInfo", () => {
    it("should validate correct user info", () => {
      const userInfo: UserInfo = {
        email: "test@example.com",
        username: "testuser",
        preferredUsername: "Test User",
        groups: ["admin"],
      }

      const result = OAuthUserParser.validateUserInfo(userInfo)
      expect(result).toBe(true)
    })

    it("should reject invalid email", () => {
      const userInfo: UserInfo = {
        email: "invalid-email",
        username: "testuser",
      }

      const result = OAuthUserParser.validateUserInfo(userInfo)
      expect(result).toBe(false)
    })

    it("should reject invalid username", () => {
      const userInfo: UserInfo = {
        email: "test@example.com",
        username: "test user!", // contains space and special char
      }

      const result = OAuthUserParser.validateUserInfo(userInfo)
      expect(result).toBe(false)
    })

    it("should reject missing required fields", () => {
      const userInfoNoEmail: any = {
        username: "testuser",
      }

      const userInfoNoUsername: any = {
        email: "test@example.com",
      }

      expect(OAuthUserParser.validateUserInfo(userInfoNoEmail)).toBe(false)
      expect(OAuthUserParser.validateUserInfo(userInfoNoUsername)).toBe(false)
    })
  })

  describe("sanitizeUserInfo", () => {
    it("should sanitize user info correctly", () => {
      const userInfo: UserInfo = {
        email: "  TEST@EXAMPLE.COM  ",
        username: "  Test-User_123  ",
        preferredUsername: "  Test User! @#$  ",
        groups: ["  admin  ", "  dev-team  ", "  users@company.com  "],
      }

      const result = OAuthUserParser.sanitizeUserInfo(userInfo)

      expect(result).toEqual({
        email: "test@example.com",
        username: "test-user_123",
        preferredUsername: "test_user_____",
        groups: ["admin", "dev-team", "users_company_com"],
      })
    })

    it("should handle missing optional fields", () => {
      const userInfo: UserInfo = {
        email: "test@example.com",
        username: "testuser",
      }

      const result = OAuthUserParser.sanitizeUserInfo(userInfo)

      expect(result).toEqual({
        email: "test@example.com",
        username: "testuser",
        preferredUsername: undefined,
        groups: undefined,
      })
    })
  })
})
