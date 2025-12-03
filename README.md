# AetherWaves - 音频可视化系统

AetherWaves 是一个基于 Web Audio API 和 Canvas 的音频可视化系统，能够将音频信号转换为动态的视觉效果，创造出沉浸式的音频视觉体验。

![AetherWaves](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.8.2-blue.svg)
![Vite](https://img.shields.io/badge/vite-6.2.0-646cff.svg)

## ✨ 特性

- 🎵 **实时音频响应** - 通过麦克风捕获环境音频，实时生成视觉效果
- 🎨 **动态可视化** - 环形频谱、粒子效果和核心光晕随音乐律动
- 🎮 **交互控制** - 可调节灵敏度，支持全屏模式
- 🔄 **模拟模式** - 当麦克风不可用时，自动切换到内置音频模拟器
- 📱 **响应式设计** - 自适应各种屏幕尺寸和设备像素比
- ⚡ **高性能渲染** - 使用 Canvas 2D API 和优化的渲染循环

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:3000` 上启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 🎯 使用方法

1. **启动应用** - 打开应用后，点击"Initialize System"按钮
2. **授权麦克风** - 浏览器将请求麦克风权限，点击"允许"
3. **享受视觉体验** - 播放音乐或发出声音，观察可视化效果
4. **调节灵敏度** - 使用底部控制滑块调整可视化敏感度
5. **全屏模式** - 点击全屏按钮获得沉浸式体验

## 🛠️ 技术栈

- **前端框架**: React 19.2.0
- **语言**: TypeScript 5.8.2
- **构建工具**: Vite 6.2.0
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **音频处理**: Web Audio API
- **图形渲染**: Canvas 2D API

## 📁 项目结构

```
aetherwaves/
├── components/
│   ├── AudioEngine.tsx    # 音频可视化和渲染引擎
│   ├── Introduction.tsx    # 欢迎界面和启动逻辑
│   └── UIControls.tsx      # 用户界面控制组件
├── App.tsx                 # 主应用组件
├── index.tsx               # 应用入口点
├── index.html              # HTML 模板
├── package.json            # 项目依赖和脚本
├── tsconfig.json           # TypeScript 配置
└── vite.config.ts          # Vite 构建配置
```

## 🎨 可视化原理

AetherWaves 使用 Web Audio API 的 `AnalyserNode` 来分析音频频谱数据，然后将这些数据转换为视觉元素：

1. **核心光晕** - 根据中频段数据调整大小和亮度
2. **环形频谱** - 将频率数据映射为环形波形，随音乐律动
3. **粒子系统** - 外围粒子根据特定频率响应移动和变化大小
4. **旋转动画** - 整体视觉效果随低音节奏旋转

## 🔧 自定义配置

### 调整可视化参数

在 `AudioEngine.tsx` 中，你可以修改以下参数来调整可视化效果：

```typescript
// FFT 大小，影响频率分辨率
ana.fftSize = 2048; 

// 平滑度，影响动画流畅度
ana.smoothingTimeConstant = 0.92;

// 增益值，影响敏感度
gain.gain.value = 1.5;
```

### 修改颜色主题

在 `AudioEngine.tsx` 的渲染函数中，调整以下颜色值：

```typescript
// 核心渐变色
coreGradient.addColorStop(0, 'rgba(200, 255, 255, 0.9)');
coreGradient.addColorStop(0.4, 'rgba(6, 182, 212, 0.3)');

// 环形频谱颜色
ctx.strokeStyle = `hsl(${180 + (bass * 0.5)}, 80%, 60%)`;
```

## 🌐 浏览器兼容性

- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

注意：由于使用了 Web Audio API，某些移动浏览器可能存在限制。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！在提交代码前，请确保：

1. 代码符合项目的 TypeScript 和 React 规范
2. 添加必要的注释和文档
3. 测试功能是否正常工作

## 🙏 致谢

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - 强大的音频处理能力
- [React](https://reactjs.org/) - 用户界面构建
- [Vite](https://vitejs.dev/) - 快速的开发工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Lucide](https://lucide.dev/) - 精美的图标库

---

*AetherWaves - 让声音看得见*