# 共享模块

这是 Code Server 的共享模块目录，包含了服务端和客户端共用的工具函数、类型定义和通用功能。

## 目录结构

```
common/
├── emitter.ts     # 事件发射器
├── http.ts        # HTTP 相关工具
└── util.ts        # 通用工具函数
```

## 核心模块

### 事件发射器 (emitter.ts)
- 基于观察者模式的事件系统
- 类型安全的事件处理
- 支持异步事件监听
- 内存泄漏防护

#### 主要功能
```typescript
// 创建事件发射器
const emitter = new Emitter<string>()

// 监听事件
const disposable = emitter.event((data) => {
  console.log('Received:', data)
})

// 发射事件
emitter.emit('Hello World')

// 清理监听器
disposable.dispose()
```

#### 使用场景
- 组件间通信
- 状态变更通知
- 异步操作回调
- 生命周期事件

### HTTP 工具 (http.ts)
- HTTP 状态码定义
- 错误响应处理
- 请求验证工具
- 响应格式化

#### HTTP 状态码
```typescript
export enum HttpCode {
  Ok = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500
}
```

#### 错误处理
```typescript
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: HttpCode
  ) {
    super(message)
  }
}
```

### 通用工具 (util.ts)
- 字符串处理函数
- 数组和对象操作
- 类型检查工具
- 常用算法实现

#### 字符串工具
```typescript
// 复数形式处理
export function plural(count: number, singular: string, plural?: string): string

// 字符串分割
export function splitOnFirstEquals(str: string): [string, string]
```

#### 类型检查
```typescript
// 检查是否为有效字符串
export function isValidString(str: unknown): str is string

// 检查是否为数字
export function isValidNumber(num: unknown): num is number
```

## 设计原则

### 类型安全
- 完整的 TypeScript 类型定义
- 泛型支持
- 类型推断优化
- 编译时错误检查

### 模块化
- 单一职责原则
- 清晰的接口定义
- 最小依赖原则
- 易于测试和维护

### 性能优化
- 惰性求值
- 内存复用
- 缓存策略
- 异步处理

### 错误处理
- 统一的错误类型
- 详细的错误信息
- 错误恢复机制
- 用户友好提示

## 使用指南

### 导入模块
```typescript
// 导入事件发射器
import { Emitter } from '../common/emitter'

// 导入 HTTP 工具
import { HttpCode, HttpError } from '../common/http'

// 导入通用工具
import { plural, isValidString } from '../common/util'
```

### 创建自定义发射器
```typescript
// 定义事件数据类型
interface UserEvent {
  userId: string
  action: 'login' | 'logout'
}

// 创建发射器实例
const userEmitter = new Emitter<UserEvent>()

// 使用发射器
userEmitter.event((event) => {
  console.log(`User ${event.userId} ${event.action}`)
})
```

### 错误处理
```typescript
// 抛出 HTTP 错误
throw new HttpError('Invalid input', HttpCode.BadRequest)

// 处理错误
try {
  // 业务逻辑
} catch (error) {
  if (error instanceof HttpError) {
    // 处理 HTTP 错误
  }
}
```

## 扩展指南

### 添加新工具函数
1. 在相应的模块文件中添加函数
2. 添加完整的类型定义
3. 编写 JSDoc 注释
4. 添加单元测试
5. 更新文档

### 创建新模块
1. 创建新的 TypeScript 文件
2. 定义模块接口
3. 实现核心功能
4. 添加导出语句
5. 创建测试文件

## 最佳实践

- 保持函数纯度和可测试性
- 使用描述性的函数和变量名
- 提供完整的类型定义
- 添加详细的文档注释
- 遵循一致的代码风格
- 优先使用不可变数据结构
