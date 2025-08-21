# Node.js 服务端代码

这是 Code Server 的服务端代码，负责提供 HTTP/WebSocket 服务器、VS Code 集成、认证管理等功能。

## 目录结构

```
node/
├── routes/         # 路由处理器和中间件
├── i18n/          # 国际化支持
├── main.ts        # 程序主入口点
├── app.ts         # Express 应用创建和配置
├── cli.ts         # 命令行参数解析和配置
├── http.ts        # HTTP 服务器工具函数
├── wsRouter.ts    # WebSocket 路由处理
├── vscodeSocket.ts # VS Code 会话管理
├── socket.ts      # Socket 代理和连接管理
├── wrapper.ts     # VS Code 模块包装器
├── update.ts      # 更新检查和下载
├── util.ts        # 工具函数
├── settings.ts    # 设置管理
├── constants.ts   # 常量定义
├── entry.ts       # 程序入口点
├── heart.ts       # 心跳检测
└── proxy.ts       # 代理配置
```

## 核心模块

### 主程序流程 (main.ts)
- 程序启动和初始化
- 命令行参数处理
- 服务器创建和启动
- 错误处理和优雅关闭

### 应用配置 (app.ts)
- Express 应用创建
- HTTP/HTTPS 服务器配置
- WebSocket 支持设置
- 中间件注册

### 命令行接口 (cli.ts)
- 参数解析和验证
- 配置文件加载
- 默认值设置
- 帮助信息生成

### 路由系统 (routes/)
- **index.ts**: 主路由注册和中间件配置
- **vscode.ts**: VS Code 相关 API 路由
- **login.ts**: 用户认证和登录
- **health.ts**: 健康检查端点
- **errors.ts**: 错误处理和响应
- **proxy.ts**: 代理和反向代理支持

### VS Code 集成 (vscodeSocket.ts)
- 编辑器会话管理
- 工作区连接
- Socket 路径管理
- 多会话支持

### WebSocket 支持 (wsRouter.ts)
- WebSocket 升级处理
- 实时通信路由
- 连接状态管理

### 工具函数 (util.ts)
- 文件系统操作
- 路径处理
- 网络连接检查
- 证书生成

## 关键特性

- **多协议支持**: HTTP/HTTPS + WebSocket
- **认证系统**: 密码认证、无认证模式
- **会话管理**: 多用户、多工作区支持
- **代理支持**: 域名和路径级别代理
- **国际化**: 多语言界面支持
- **扩展管理**: VS Code 扩展的完整支持
- **安全特性**: HTTPS、CSP、认证等

## 开发说明

- 使用 TypeScript 编写，提供完整的类型支持
- 基于 Express 框架构建 Web 服务
- 支持热重载和开发模式
- 完整的错误处理和日志记录
- 模块化设计，便于维护和扩展
