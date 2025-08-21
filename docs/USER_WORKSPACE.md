# Code Server 用户工作区管理

本文档介绍了 Code Server 的用户工作区管理功能，该功能支持 OAuth 认证模式下的自动用户工作区创建和管理。

## 功能概述

用户工作区管理功能允许 Code Server 在 OAuth 模式下：

- 自动检测 OAuth 代理传递的用户信息
- 为每个用户创建独立的工作区目录
- 支持文件夹和工作区文件两种模式
- 自动重定向用户到其专属工作区
- 提供工作区统计和管理功能

## 架构设计

```
OAuth 代理 → Code Server → 用户空间管理中间件 → VS Code 编辑器
                ↓
        用户空间管理模块
                ↓
        动态工作区创建/管理
```

### 核心组件

1. **OAuthUserParser**: 解析 OAuth 代理传递的用户信息
2. **UserWorkspaceManager**: 管理用户工作区的创建和维护
3. **用户工作区中间件**: 集成到 Express 路由系统
4. **配置系统**: 支持灵活的工作区配置

## 配置选项

### 基本配置

```yaml
# 认证模式
auth: none  # 必须设置为 none 以启用 OAuth 模式

# 用户数据目录
user-data-dir: /home/workspace
```

### 用户工作区配置

```yaml
# 用户工作区基础目录（默认为 user-data-dir）
user-workspace-base-dir: /home/workspace

# 用户工作区子目录名（默认为 'users'）
user-workspace-sub-dir: users

# 默认工作区类型（默认为 'folder'）
user-workspace-type: folder  # 可选: 'folder' 或 'workspace'

# 是否创建工作区文件（默认为 false）
create-user-workspace-file: false

# 自定义工作区文件模板路径（可选）
user-workspace-file-template: /path/to/template.json
```

### 完整配置示例

```yaml
# config.yaml
bind-addr: 0.0.0.0:8080
auth: none

# 用户数据目录
user-data-dir: /home/workspace

# 用户工作区配置
user-workspace-base-dir: /home/workspace
user-workspace-sub-dir: users
user-workspace-type: folder
create-user-workspace-file: false

# 扩展目录
extensions-dir: /home/workspace/extensions

# 其他配置
disable-update-check: true
disable-telemetry: true
```

## OAuth 代理配置

### 必需的 Header

OAuth 代理必须转发以下 Header 到 Code Server：

- `X-Forwarded-User`: 用户名（必需）
- `X-Forwarded-Email`: 用户邮箱（必需）
- `X-Forwarded-Preferred-Username`: 首选用户名（可选）
- `X-Forwarded-Groups`: 用户组（可选）

### oauth2-proxy 配置示例

```bash
oauth2-proxy \
  --provider=google \
  --email-domain=yourcompany.com \
  --upstream=http://localhost:8080 \
  --http-address=0.0.0.0:4180 \
  --cookie-secure=false \
  --cookie-expire=1h \
  --set-xauthrequest=true \
  --pass-access-token=true \
  --pass-authorization-header=true
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:4180;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 转发 OAuth 用户信息
        proxy_set_header X-Forwarded-User $http_x_forwarded_user;
        proxy_set_header X-Forwarded-Email $http_x_forwarded_email;
        proxy_set_header X-Forwarded-Preferred-Username $http_x_forwarded_preferred_username;
        proxy_set_header X-Forwarded-Groups $http_x_forwarded_groups;
    }
}
```

## 部署指南

### 1. 快速部署

使用提供的部署脚本：

```bash
# 下载脚本
wget https://raw.githubusercontent.com/your-repo/code-server/main/scripts/setup-user-workspaces.sh

# 设置执行权限
chmod +x setup-user-workspaces.sh

# 运行脚本（需要 root 权限）
sudo ./setup-user-workspaces.sh
```

### 2. 手动部署

#### 创建目录结构

```bash
# 创建工作目录
sudo mkdir -p /home/workspace/users
sudo mkdir -p /home/workspace/extensions
sudo mkdir -p /etc/code-server

# 设置权限
sudo chown -R coder:coder /home/workspace
sudo chmod 755 /home/workspace
```

#### 创建配置文件

```bash
sudo tee /etc/code-server/config.yaml > /dev/null << EOF
bind-addr: 0.0.0.0:8080
auth: none
user-data-dir: /home/workspace
user-workspace-base-dir: /home/workspace
user-workspace-sub-dir: users
user-workspace-type: folder
create-user-workspace-file: false
extensions-dir: /home/workspace/extensions
disable-update-check: true
disable-telemetry: true
EOF
```

#### 启动服务

```bash
# 使用配置文件启动
code-server --config /etc/code-server/config.yaml

# 或者使用命令行参数
code-server \
  --auth none \
  --user-data-dir /home/workspace \
  --user-workspace-base-dir /home/workspace \
  --user-workspace-sub-dir users \
  --user-workspace-type folder \
  --create-user-workspace-file false
```

### 3. Docker 部署

```dockerfile
FROM codercom/code-server:latest

# 创建用户工作区目录
RUN mkdir -p /home/workspace/users

# 设置环境变量
ENV USER_DATA_DIR=/home/workspace
ENV USER_WORKSPACE_BASE_DIR=/home/workspace
ENV USER_WORKSPACE_SUB_DIR=users
ENV USER_WORKSPACE_TYPE=folder
ENV CREATE_USER_WORKSPACE_FILE=false

# 启动命令
CMD ["code-server", \
     "--auth", "none", \
     "--user-data-dir", "/home/workspace", \
     "--user-workspace-base-dir", "/home/workspace", \
     "--user-workspace-sub-dir", "users", \
     "--user-workspace-type", "folder", \
     "--create-user-workspace-file", "false", \
     "--bind-addr", "0.0.0.0:8080"]
```

## 工作流程

### 1. 用户访问流程

```
1. 用户访问 Code Server
2. OAuth 代理进行身份验证
3. OAuth 代理转发请求到 Code Server（包含用户信息 Header）
4. Code Server 解析用户信息
5. 检查用户工作区是否存在
6. 如果不存在，自动创建用户工作区
7. 重定向用户到其专属工作区
8. 用户进入 VS Code 编辑器
```

### 2. 工作区创建流程

```
1. 解析 OAuth Header 中的用户信息
2. 生成用户 ID（基于邮箱哈希）
3. 创建用户工作区目录
4. 设置目录权限
5. 创建 .gitkeep 文件
6. 创建用户信息文件
7. 如果配置了，创建工作区文件
8. 更新统计信息
```

## 目录结构

```
/home/workspace/
├── users/                    # 用户工作区目录
│   ├── a1b2c3d4/           # 用户 1 的工作区
│   │   ├── .gitkeep
│   │   ├── .user-info.json
│   │   └── a1b2c3d4.code-workspace (可选)
│   ├── e5f6g7h8/           # 用户 2 的工作区
│   │   ├── .gitkeep
│   │   ├── .user-info.json
│   │   └── e5f6g7h8.code-workspace (可选)
│   └── ...
├── extensions/              # VS Code 扩展目录
└── data/                   # Code Server 数据目录
    ├── User/               # 用户设置
    ├── Machine/            # 机器设置
    └── ...
```

## 监控和日志

### 日志输出

启动时会显示用户工作区配置信息：

```
[INFO] User workspace management enabled
[INFO]   - Base workspace directory: /home/workspace
[INFO]   - User workspace subdirectory: users
[INFO]   - Default workspace type: folder
[INFO]   - Create workspace files: false
```

### 调试日志

启用详细日志以查看工作区创建过程：

```bash
code-server --config /etc/code-server/config.yaml --log debug
```

### 工作区统计

可以通过日志查看工作区统计信息：

```
[DEBUG] User workspace middleware processed
[DEBUG] userId: a1b2c3d4
[DEBUG] workspacePath: /home/workspace/users/a1b2c3d4
[DEBUG] workspaceType: folder
```

## 故障排除

### 常见问题

#### 1. 用户工作区未创建

**症状**: 用户访问时没有自动创建工作区

**检查项**:
- 确认 `auth: none` 设置
- 检查 OAuth Header 是否正确传递
- 查看日志中的错误信息
- 确认目录权限设置

**解决方案**:
```bash
# 检查配置
cat /etc/code-server/config.yaml

# 检查目录权限
ls -la /home/workspace/

# 查看服务日志
journalctl -u code-server -f
```

#### 2. 权限错误

**症状**: 无法创建用户工作区目录

**解决方案**:
```bash
# 设置正确的目录权限
sudo chown -R coder:coder /home/workspace
sudo chmod 755 /home/workspace

# 重启服务
sudo systemctl restart code-server
```

#### 3. OAuth Header 未传递

**症状**: 用户信息无法解析

**检查项**:
- 确认 OAuth 代理配置
- 检查反向代理设置
- 验证 Header 名称是否正确

**解决方案**:
```bash
# 测试 Header 传递
curl -H "X-Forwarded-User: testuser" \
     -H "X-Forwarded-Email: test@example.com" \
     http://localhost:8080/

# 检查 Nginx 配置
nginx -t
sudo systemctl reload nginx
```

### 性能优化

#### 1. 工作区缓存

用户工作区信息会缓存在内存中，减少文件系统访问。

#### 2. 异步操作

工作区创建和统计更新使用异步操作，不阻塞用户请求。

#### 3. 错误处理

工作区创建失败不会阻塞用户访问，会记录错误日志并继续处理。

## 安全考虑

### 1. 用户隔离

- 每个用户有独立的工作区目录
- 用户 ID 基于邮箱哈希生成，避免路径遍历攻击
- 目录权限设置为 755，确保安全性

### 2. 输入验证

- 验证邮箱格式
- 清理用户名中的特殊字符
- 限制工作区路径长度

### 3. 权限控制

- 工作区目录权限设置为 755
- 用户信息文件权限设置为 644
- 支持自定义目录权限设置

## 扩展功能

### 1. 自定义工作区模板

可以通过配置文件指定自定义的工作区文件模板：

```yaml
user-workspace-file-template: /path/to/custom-template.json
```

### 2. 用户组支持

支持从 OAuth Header 中解析用户组信息，可用于后续的权限控制。

### 3. 工作区统计

提供工作区使用统计信息，包括用户数量、磁盘使用量等。

## 贡献和反馈

如果您在使用过程中遇到问题或有改进建议，请：

1. 查看现有的 [Issues](https://github.com/coder/code-server/issues)
2. 创建新的 Issue 描述问题
3. 提交 Pull Request 贡献代码
4. 参与社区讨论

## Docker 镜像构建

### 构建自定义镜像

本项目支持构建和推送自定义 Docker 镜像到 Google Artifact Registry：

```bash
# 设置版本号
VERSION=4.103.1-galxe

# 构建并推送镜像
npm run publish:docker:galxe
```

### 可用的镜像标签

构建完成后，以下镜像标签将可用：

- `us-west1-docker.pkg.dev/galxe-internal-artifacts/galxe-app/code-server:latest`
- `us-west1-docker.pkg.dev/galxe-internal-artifacts/galxe-app/code-server:4.103.1-galxe`
- `us-west1-docker.pkg.dev/galxe-internal-artifacts/galxe-app/code-server:debian`
- `us-west1-docker.pkg.dev/galxe-internal-artifacts/galxe-app/code-server:bookworm`
- `us-west1-docker.pkg.dev/galxe-internal-artifacts/galxe-app/code-server:ubuntu`
- `us-west1-docker.pkg.dev/galxe-app/code-server:focal`

### 构建要求

- 安装 `nfpm` 工具：`brew install nfpm`
- 配置 Google Cloud 认证：`gcloud auth configure-docker us-west1-docker.pkg.dev`
- 确保有足够的磁盘空间用于构建

## 许可证

本功能遵循 Code Server 的许可证条款。
