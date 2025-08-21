# 静态资源

这是 Code Server 的静态资源目录，包含了所有的图标、图片和其他媒体文件。

## 目录结构

```
media/
├── favicon.ico                    # 网站图标 (ICO 格式)
├── favicon.svg                    # 网站图标 (SVG 格式)
├── favicon-dark-support.svg       # 深色主题支持图标
├── pwa-icon-192.png              # PWA 图标 192x192
├── pwa-icon-512.png              # PWA 图标 512x512
├── pwa-icon-maskable-192.png     # 可遮罩 PWA 图标 192x192
├── pwa-icon-maskable-512.png     # 可遮罩 PWA 图标 512x512
├── templates.png                  # 模板预览图
└── README.md                      # 本文档
```

## 图标资源详解

### 网站图标 (Favicon)

#### favicon.ico
- **格式**: ICO (Windows 图标格式)
- **尺寸**: 16x16, 32x32, 48x48 像素
- **用途**: 浏览器标签页、书签、收藏夹
- **兼容性**: 所有主流浏览器

#### favicon.svg
- **格式**: SVG (矢量图形)
- **优势**: 无限缩放、文件小、支持主题
- **用途**: 现代浏览器支持
- **特性**: 响应式、可编程

#### favicon-dark-support.svg
- **格式**: SVG 矢量图形
- **特性**: 自动适应系统主题
- **用途**: 深色模式支持
- **优势**: 更好的视觉体验

### PWA 图标

#### 标准 PWA 图标
- **pwa-icon-192.png**: 192x192 像素，适用于大多数设备
- **pwa-icon-512.png**: 512x512 像素，高分辨率设备

#### 可遮罩 PWA 图标
- **pwa-icon-maskable-192.png**: 192x192 像素，支持 Android 自适应图标
- **pwa-icon-maskable-512.png**: 512x512 像素，高分辨率自适应图标

#### PWA 图标特性
- 支持应用安装到主屏幕
- 提供原生应用体验
- 支持离线功能
- 推送通知支持

### 其他资源

#### templates.png
- **格式**: PNG 位图
- **用途**: 模板预览和展示
- **特性**: 高质量图像展示

## 技术规范

### 图标设计标准
- **尺寸规范**: 遵循标准尺寸要求
- **格式选择**: 优先使用 SVG 格式
- **颜色规范**: 支持主题切换
- **清晰度**: 确保各种尺寸下的清晰度

### 文件优化
- **压缩**: 使用适当的压缩算法
- **格式**: 选择合适的文件格式
- **大小**: 控制文件大小
- **缓存**: 支持浏览器缓存

### 浏览器兼容性
- **现代浏览器**: 支持 SVG 和现代特性
- **旧版浏览器**: 提供 ICO 格式兼容
- **移动设备**: 支持触摸设备优化
- **PWA 支持**: 渐进式 Web 应用

## 使用指南

### HTML 引用
```html
<!-- 标准图标 -->
<link rel="icon" href="/media/favicon.ico" />
<link rel="icon" href="/media/favicon.svg" type="image/svg+xml" />

<!-- PWA 图标 -->
<link rel="apple-touch-icon" sizes="192x192" href="/media/pwa-icon-192.png" />
<link rel="apple-touch-icon" sizes="512x512" href="/media/pwa-icon-512.png" />

<!-- PWA 清单 -->
<link rel="manifest" href="/manifest.json" />
```

### CSS 引用
```css
/* 使用图标作为背景 */
.icon {
  background-image: url('/media/favicon.svg');
  background-size: contain;
  background-repeat: no-repeat;
}

/* 深色主题支持 */
@media (prefers-color-scheme: dark) {
  .icon {
    background-image: url('/media/favicon-dark-support.svg');
  }
}
```

### JavaScript 引用
```javascript
// 动态设置图标
function setFavicon(theme) {
  const link = document.querySelector('link[rel="icon"]');
  if (theme === 'dark') {
    link.href = '/media/favicon-dark-support.svg';
  } else {
    link.href = '/media/favicon.svg';
  }
}
```

## 开发指南

### 添加新图标
1. 准备图标文件 (推荐 SVG 格式)
2. 生成多种尺寸版本
3. 优化文件大小
4. 添加到 media 目录
5. 更新相关引用

### 图标设计原则
- 保持简洁明了
- 确保小尺寸下的可识别性
- 支持单色和多色模式
- 考虑不同背景下的可见性

### 性能优化
- 使用适当的文件格式
- 压缩和优化文件
- 实现懒加载
- 利用浏览器缓存

## 最佳实践

### 图标管理
- 保持文件命名一致性
- 使用版本控制管理
- 定期检查和更新
- 测试各种使用场景

### 用户体验
- 提供清晰的视觉反馈
- 支持主题切换
- 确保可访问性
- 优化加载性能

### 维护更新
- 定期检查图标质量
- 更新过时的图标
- 优化文件大小
- 测试兼容性
