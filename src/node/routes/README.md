# 路由系统

这是 Code Server 的路由处理器目录，包含了所有的 HTTP 路由、中间件和 API 端点。

## 目录结构

```
routes/
├── index.ts        # 主路由注册和中间件配置
├── vscode.ts      # VS Code 相关 API 路由
├── login.ts       # 用户认证和登录处理
├── logout.ts      # 用户登出处理
├── health.ts      # 健康检查端点
├── errors.ts      # 错误处理和响应
├── update.ts      # 更新检查和下载
├── domainProxy.ts # 域名级别代理
└── pathProxy.ts   # 路径级别代理
```

## 核心路由

### 主路由注册 (index.ts)
- 路由和中间件的统一注册
- 认证中间件配置
- 静态文件服务
- 错误处理中间件
- 心跳检测集成

### VS Code 集成 (vscode.ts)
- VS Code 服务器的动态加载
- 编辑器 API 的代理转发
- WebSocket 升级处理
- 工作区管理
- 扩展管理支持

### 认证系统 (login.ts)
- 用户登录表单处理
- 密码验证和会话创建
- 认证状态管理
- 安全重定向

### 健康检查 (health.ts)
- 服务器状态监控
- 连接数统计
- 系统资源检查
- 负载均衡支持

### 错误处理 (errors.ts)
- HTTP 错误响应
- WebSocket 错误处理
- 用户友好的错误页面
- 错误日志记录

### 代理支持
- **domainProxy.ts**: 基于域名的代理转发
- **pathProxy.ts**: 基于路径的代理转发
- 反向代理环境支持
- 负载均衡集成

## 中间件系统

### 认证中间件
- 密码认证验证
- 会话状态检查
- 权限控制
- 安全头设置

### 通用中间件
- 请求日志记录
- 压缩支持
- Cookie 解析
- 心跳检测

### 错误处理中间件
- 异常捕获
- 错误格式化
- 状态码设置
- 用户反馈

## API 端点

### 认证相关
- `POST /login` - 用户登录
- `POST /logout` - 用户登出
- `GET /session` - 会话状态

### 系统状态
- `GET /healthz` - 健康检查
- `GET /update` - 更新信息

### VS Code 集成
- `/*` - VS Code 编辑器路由
- WebSocket 升级端点

### 代理端点
- 动态代理路由
- 域名代理支持
- 路径代理支持

## 安全特性

- 密码哈希验证
- 会话管理
- CSRF 保护
- 内容安全策略 (CSP)
- HTTPS 强制重定向

## 开发说明

- 基于 Express.js 路由系统
- 支持 RESTful API 设计
- 完整的错误处理链
- 中间件可插拔设计
- 支持异步路由处理
