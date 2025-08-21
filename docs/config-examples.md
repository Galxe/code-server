# Code Server 配置文件示例

本文档提供了各种部署场景下的 Code Server 配置文件示例，包括用户工作区管理功能。

## 基本配置

### 最小配置

```yaml
# config.yaml
bind-addr: 127.0.0.1:8080
auth: password
password: your-password-here
```

### 标准配置

```yaml
# config.yaml
bind-addr: 0.0.0.0:8080
auth: password
password: your-password-here
cert: false
user-data-dir: ~/.local/share/code-server
extensions-dir: ~/.local/share/code-server/extensions
disable-update-check: true
disable-telemetry: true
```

## OAuth 用户工作区管理配置

### 基本 OAuth 配置

```yaml
# config.yaml
bind-addr: 0.0.0.0:8080
auth: none  # 必须设置为 none 以启用 OAuth 模式

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

### 高级 OAuth 配置

```yaml
# config.yaml
bind-addr: 0.0.0.0:8080
auth: none

# 用户数据目录
user-data-dir: /home/workspace

# 用户工作区配置
user-workspace-base-dir: /home/workspace
user-workspace-sub-dir: users
user-workspace-type: workspace  # 使用 .code-workspace 文件
create-user-workspace-file: true

# 扩展目录
extensions-dir: /home/workspace/extensions

# 代理配置
proxy-domain: []
disable-proxy: false

# 安全配置
trusted-origins: []

# 日志配置
log: info
verbose: false

# 应用配置
app-name: "Code Server"
welcome-text: "Welcome to Code Server"

# 其他配置
disable-update-check: true
disable-telemetry: true
```

### 生产环境配置

```yaml
# config.yaml
bind-addr: 0.0.0.0:8080
auth: none

# 用户数据目录
user-data-dir: /opt/code-server/workspace

# 用户工作区配置
user-workspace-base-dir: /opt/code-server/workspace
user-workspace-sub-dir: users
user-workspace-type: folder
create-user-workspace-file: false

# 扩展目录
extensions-dir: /opt/code-server/workspace/extensions

# HTTPS 配置
cert: /etc/ssl/certs/code-server.crt
cert-key: /etc/ssl/private/code-server.key

# 代理配置
proxy-domain: ["*.yourdomain.com"]
disable-proxy: false

# 安全配置
trusted-origins: ["https://yourdomain.com"]

# 日志配置
log: warn
verbose: false

# 应用配置
app-name: "Your Company Code Server"
welcome-text: "Welcome to Your Company Development Environment"

# 其他配置
disable-update-check: true
disable-telemetry: true
```

## 环境变量配置

### 基本环境变量

```bash
# 认证配置
export AUTH=none

# 用户数据目录
export USER_DATA_DIR=/home/workspace

# 用户工作区配置
export USER_WORKSPACE_BASE_DIR=/home/workspace
export USER_WORKSPACE_SUB_DIR=users
export USER_WORKSPACE_TYPE=folder
export CREATE_USER_WORKSPACE_FILE=false

# 扩展目录
export EXTENSIONS_DIR=/home/workspace/extensions

# 其他配置
export DISABLE_UPDATE_CHECK=true
export DISABLE_TELEMETRY=true
```

### Docker 环境变量

```bash
# Docker 运行命令
docker run -d --name code-server-oauth -p 8080:8080 \
  -v /home/workspace:/home/workspace \
  -e AUTH=none \
  -e USER_DATA_DIR=/home/workspace \
  -e USER_WORKSPACE_BASE_DIR=/home/workspace \
  -e USER_WORKSPACE_SUB_DIR=users \
  -e USER_WORKSPACE_TYPE=folder \
  -e CREATE_USER_WORKSPACE_FILE=false \
  -e EXTENSIONS_DIR=/home/workspace/extensions \
  -e DISABLE_UPDATE_CHECK=true \
  -e DISABLE_TELEMETRY=true \
  codercom/code-server:latest
```

## 命令行参数配置

### 基本命令行

```bash
code-server \
  --auth none \
  --user-data-dir /home/workspace \
  --user-workspace-base-dir /home/workspace \
  --user-workspace-sub-dir users \
  --user-workspace-type folder \
  --create-user-workspace-file false \
  --extensions-dir /home/workspace/extensions \
  --disable-update-check \
  --disable-telemetry
```

### 高级命令行

```bash
code-server \
  --auth none \
  --bind-addr 0.0.0.0:8080 \
  --user-data-dir /opt/code-server/workspace \
  --user-workspace-base-dir /opt/code-server/workspace \
  --user-workspace-sub-dir users \
  --user-workspace-type workspace \
  --create-user-workspace-file true \
  --extensions-dir /opt/code-server/workspace/extensions \
  --cert /etc/ssl/certs/code-server.crt \
  --cert-key /etc/ssl/private/code-server.key \
  --proxy-domain "*.yourdomain.com" \
  --trusted-origins "https://yourdomain.com" \
  --log warn \
  --app-name "Your Company Code Server" \
  --welcome-text "Welcome to Your Company Development Environment" \
  --disable-update-check \
  --disable-telemetry
```

## 配置文件位置

### 默认位置

- **Linux/macOS**: `~/.config/code-server/config.yaml`
- **Windows**: `%APPDATA%\code-server\config.yaml`

### 自定义位置

```bash
# 使用 --config 参数指定配置文件位置
code-server --config /etc/code-server/config.yaml

# 使用环境变量
export CODE_SERVER_CONFIG=/etc/code-server/config.yaml
code-server
```

## 配置验证

### 检查配置

```bash
# 验证配置文件语法
code-server --config /path/to/config.yaml --help

# 检查配置是否正确加载
code-server --config /path/to/config.yaml --log debug
```

### 配置优先级

配置的优先级顺序（从高到低）：

1. 命令行参数
2. 配置文件
3. 环境变量
4. 默认值

## 常见配置场景

### 开发环境

```yaml
# config-dev.yaml
bind-addr: 127.0.0.1:8080
auth: none
user-data-dir: ~/dev-workspace
user-workspace-base-dir: ~/dev-workspace
user-workspace-sub-dir: users
user-workspace-type: folder
create-user-workspace-file: false
log: debug
verbose: true
```

### 测试环境

```yaml
# config-test.yaml
bind-addr: 0.0.0.0:8080
auth: none
user-data-dir: /tmp/test-workspace
user-workspace-base-dir: /tmp/test-workspace
user-workspace-sub-dir: users
user-workspace-type: folder
create-user-workspace-file: false
log: info
disable-update-check: true
disable-telemetry: true
```

### 生产环境

```yaml
# config-prod.yaml
bind-addr: 0.0.0.0:8080
auth: none
user-data-dir: /opt/code-server/workspace
user-workspace-base-dir: /opt/code-server/workspace
user-workspace-sub-dir: users
user-workspace-type: folder
create-user-workspace-file: false
extensions-dir: /opt/code-server/workspace/extensions
cert: /etc/ssl/certs/code-server.crt
cert-key: /etc/ssl/private/code-server.key
proxy-domain: ["*.yourdomain.com"]
trusted-origins: ["https://yourdomain.com"]
log: warn
app-name: "Production Code Server"
disable-update-check: true
disable-telemetry: true
```

## 故障排除

### 配置问题

1. **配置文件语法错误**: 检查 YAML 语法
2. **权限问题**: 确保配置文件可读
3. **路径问题**: 验证所有路径是否存在
4. **参数冲突**: 检查命令行和配置文件的一致性

### 常见错误

```bash
# 错误：配置文件不存在
Error: ENOENT: no such file or directory, open '/path/to/config.yaml'

# 解决：创建配置文件或检查路径
mkdir -p /path/to
touch /path/to/config.yaml

# 错误：权限被拒绝
Error: EACCES: permission denied, open '/path/to/config.yaml'

# 解决：设置正确的权限
chmod 644 /path/to/config.yaml
chown $USER:$USER /path/to/config.yaml
```

## 最佳实践

1. **使用配置文件**: 便于管理和版本控制
2. **环境分离**: 为不同环境创建不同的配置文件
3. **安全配置**: 生产环境使用 HTTPS 和适当的权限
4. **日志配置**: 根据环境调整日志级别
5. **备份配置**: 定期备份配置文件
6. **版本控制**: 将配置文件纳入版本控制系统

## 相关文档

- [用户工作区管理](USER_WORKSPACE.md)
- [安装指南](install.md)
- [配置指南](guide.md)
- [常见问题](FAQ.md)
