# GeekTime 技术电子书库

一个基于 **VitePress + Vue 3** 的个人技术电子书阅读站点，支持 **Markdown 章节阅读** 与 **PDF 在线预览（PDF.js 官方阅读器）**。适合整理多本技术电子书，统一入口访问。

## 主要功能
- 多本技术书籍统一入口
- Markdown 章节阅读（自动侧边栏 / 上一章下一章）
- PDF 在线阅读（PDF.js 官方阅读器新窗口打开）
- 首页卡片式书籍展示
- 自动同步书籍列表（脚本生成导航/首页/PDF列表）

## 目录结构（关键）
```
docs/
├── .vitepress/
│   ├── config.ts
│   └── theme/
│       ├── index.ts
│       └── style.css
├── index.md
├── books/              # Markdown 书籍目录（每本书一个子目录）
├── public/
│   └── pdf/            # PDF 原文件放这里
├── pdf-viewer/
│   ├── index.md
│   └── PdfViewer.vue
scripts/
├── sync-books.mjs      # 自动同步书单脚本
└── books-map.json      # 书名映射（slug -> 中文标题 / pdf文件名 -> 中文标题）
```

## 快速开始
安装依赖：
```
npm install
```

启动开发：
```
npm run docs:dev
```

构建发布：
```
npm run docs:build
```

## 添加新书
### 1. 添加 Markdown 书籍
1. 把书籍目录放到 `docs/books/新目录名/`
2. 在 `scripts/books-map.json` 中补充中文书名（可选，但建议）
3. 运行：
```
npm run books:sync
```
或直接重启 `npm run docs:dev`（会自动同步）

### 2. 添加 PDF 书籍
1. 把 PDF 放到 `docs/public/pdf/`
2. 在 `scripts/books-map.json` 中补充 PDF 标题（可选）
3. 运行：
```
npm run books:sync
```

## 自动化脚本说明
`npm run books:sync` 会自动：
- 扫描 `docs/books/` 生成 `config.ts` 里的书籍列表
- 更新首页 Markdown 书籍卡片
- 更新 PDF 阅读页常用链接

> 注意：PDF 必须放在 `docs/public/pdf/`，否则不会被同步脚本识别。

## 部署
如果部署到子路径（例如：`https://guohuaijian.github.io/app/book/`），请确认：
- `docs/.vitepress/config.ts` 中 `base` 已设置为 `/app/book/`

## 联系方式
- GitHub: https://github.com/GuoHuaijian
- 博客: https://slothcoder.cn
- 邮箱: guohuaijian9527@gmail.com

## 免责声明
内容来源于网络，仅供学习交流使用。若有侵权，请联系邮箱删除。
