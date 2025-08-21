# Code Server 源代码结构

这是 Code Server 项目的源代码目录，包含了将 VS Code 转换为 Web 应用程序的所有核心代码。

## 目录结构

```
src/
├── node/           # Node.js 服务端代码
├── browser/        # 浏览器客户端代码  
└── common/         # 共享的工具和类型定义
```

## 整体架构

Code Server 采用客户端-服务器架构：

- **服务端 (node/)**: 基于 Node.js 和 Express 的 HTTP/WebSocket 服务器
- **客户端 (browser/)**: 基于 HTML/CSS/JavaScript 的 Web 界面
- **共享模块 (common/)**: 两端共用的工具函数和类型定义

## 核心功能

- VS Code 编辑器的 Web 化
- 远程开发环境支持
- 多用户认证和会话管理
- 扩展管理和安装
- 实时协作和同步
- 代理和反向代理支持

## 技术栈

- **后端**: Node.js, Express, WebSocket
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **通信**: HTTP/HTTPS, WebSocket
- **构建**: TypeScript, Webpack

## 开发指南

详细的开发说明请参考各个子目录中的 README 文档。
