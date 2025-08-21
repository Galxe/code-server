# 页面组件

这是 Code Server 的页面组件目录，包含了所有的 HTML 模板和对应的 CSS 样式文件。

## 目录结构

```
pages/
├── login.html      # 登录页面模板
├── login.css       # 登录页面样式
├── error.html      # 错误页面模板
├── error.css       # 错误页面样式
├── global.css      # 全局样式定义
└── README.md       # 本文档
```

## 页面组件详解

### 登录页面 (login.html + login.css)

#### 功能特性
- 用户身份验证界面
- 响应式设计，支持多种设备
- 表单验证和错误提示
- 安全的重定向机制

#### HTML 结构
```html
<div class="center-container">
  <div class="card-box">
    <div class="header">
      <h1 class="main">{{WELCOME_TEXT}}</h1>
      <div class="sub">{{I18N_LOGIN_BELOW}} {{PASSWORD_MSG}}</div>
    </div>
    <div class="content">
      <form class="login-form" method="post">
        <!-- 表单内容 -->
      </form>
    </div>
  </div>
</div>
```

#### 样式特性
- 居中布局设计
- 卡片式界面风格
- 现代化的表单样式
- 深色/浅色主题支持

### 错误页面 (error.html + error.css)

#### 功能特性
- HTTP 错误状态显示
- 用户友好的错误信息
- 操作建议和帮助链接
- 返回和重试选项

#### HTML 结构
```html
<div class="error-container">
  <div class="error-content">
    <h1>{{ERROR_TITLE}}</h1>
    <p>{{ERROR_MESSAGE}}</p>
    <div class="error-actions">
      <!-- 操作按钮 -->
    </div>
  </div>
</div>
```

#### 样式特性
- 清晰的错误信息展示
- 突出的操作按钮
- 一致的视觉风格
- 响应式布局

### 全局样式 (global.css)

#### 设计系统
- CSS 变量定义
- 颜色主题系统
- 字体和排版规范
- 间距和尺寸标准

#### 组件样式
- 按钮组件样式
- 表单元素样式
- 卡片组件样式
- 导航组件样式

#### 响应式设计
- 移动端适配
- 平板设备支持
- 桌面端优化
- 断点系统

## 技术特性

### 模板系统
- 使用 Handlebars 风格的模板语法
- 支持动态内容插入
- 国际化字符串支持
- 条件渲染支持

### 样式架构
- CSS 模块化设计
- BEM 命名规范
- 组件化样式组织
- 主题切换支持

### 可访问性
- 语义化 HTML 标签
- ARIA 属性支持
- 键盘导航支持
- 屏幕阅读器兼容

### 性能优化
- CSS 压缩和优化
- 关键 CSS 内联
- 懒加载支持
- 缓存策略

## 开发指南

### 添加新页面
1. 创建 HTML 模板文件
2. 创建对应的 CSS 样式文件
3. 添加国际化字符串
4. 在路由中注册页面
5. 测试页面功能

### 样式开发规范
```css
/* 使用 CSS 变量 */
:root {
  --primary-color: #007acc;
  --secondary-color: #6c757d;
}

/* 组件样式 */
.login-form {
  /* 样式定义 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  /* 移动端样式 */
}
```

### 模板开发规范
```html
<!-- 使用语义化标签 -->
<main class="page-content">
  <section class="login-section">
    <!-- 内容 -->
  </section>
</main>

<!-- 添加可访问性属性 -->
<button type="submit" aria-label="登录">
  登录
</button>
```

## 最佳实践

### 设计原则
- 保持界面简洁明了
- 提供清晰的视觉层次
- 确保良好的用户体验
- 支持多种使用场景

### 代码质量
- 遵循 HTML5 标准
- 使用语义化标签
- 保持 CSS 的可维护性
- 添加必要的注释

### 测试验证
- 跨浏览器兼容性测试
- 响应式布局验证
- 可访问性检查
- 性能指标测试
