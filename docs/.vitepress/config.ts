import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const books = [
  // AUTO-BOOKS-START
  { slug: 'arch-from-zero', title: '从0开始学架构' },
  { slug: 'network-talk', title: '趣谈网络协议' },
  { slug: 'design-pattern', title: '设计模式之美' },
  { slug: 'algo-beauty', title: '数据结构与算法之美' },
  { slug: 'http-insight', title: '透视HTTP协议' },
  { slug: 'left-ear', title: '左耳听风' },
  { slug: 'go-36', title: 'Go语言核心36讲' },
  { slug: 'java-practice', title: 'Java开发编程实战' },
  { slug: 'mysql-45', title: 'MySQL实战45讲' },
  { slug: 'redis-core', title: 'Redis核心技术与实战' },
  { slug: 'redis-source', title: 'Redis源码剖析与实战' },
// AUTO-BOOKS-END
]

const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' })

function getSidebarItems(slug: string) {
  const dir = path.resolve(__dirname, '..', 'books', slug)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

  files.sort((a, b) => {
    if (a.toLowerCase() === 'index.md') return -1
    if (b.toLowerCase() === 'index.md') return 1
    return collator.compare(a, b)
  })

  return files.map((file) => {
    const isIndex = file.toLowerCase() === 'index.md'
    const text = isIndex ? '简介' : file.replace(/\.md$/, '')
    const link = isIndex
      ? `/books/${slug}/`
      : encodeURI(`/books/${slug}/${file.replace(/\.md$/, '')}`)
    return { text, link }
  })
}

const sidebar = Object.fromEntries(
  books.map((book) => [
    `/books/${book.slug}/`,
    [
      {
        text: book.title,
        items: getSidebarItems(book.slug)
      }
    ]
  ])
)

export default {
  lang: 'zh-CN',
  title: 'GeekTime 技术电子书库',
  description: '系统化整理 Go / Java / MySQL / 架构相关技术内容',
  base: '/e-book/',
  cleanUrls: true,
  ignoreDeadLinks: true,
  appearance: true,
  vite: {
    assetsInclude: ['**/*.pdf']
  },
  markdown: {
    config: (md) => {
      md.set({ html: true })
      const decodeEntities = (input: string) =>
        input
          .replace(/&amp;/g, '&')
          .replace(/&#x2F;/gi, '/')
          .replace(/&#47;/g, '/')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
      const stripHtmlOutsideCode = (src: string) => {
        const lines = src.split('\n')
        let inFence = false
        let fenceMarker = ''
        return lines
          .map((line) => {
            const trimmed = line.trimStart()
            const fenceMatch = trimmed.match(/^(```+|~~~+)\s*(.*)$/)
            if (fenceMatch) {
              const marker = fenceMatch[1]
              const info = (fenceMatch[2] || '').trim()
              const hasHtml = /[<>]/.test(info)
              if (!hasHtml) {
                if (!inFence) {
                  inFence = true
                  fenceMarker = marker
                } else if (marker === fenceMarker && info.length === 0) {
                  inFence = false
                  fenceMarker = ''
                }
                return line
              }
            }
            if (inFence) return line
            return line.replace(/<[^>]+>/g, '')
          })
          .join('\n')
      }

      const defaultRender = md.render.bind(md)
      const isBookPath = (env: any) => {
        const rel = env?.relativePath || ''
        const abs = env?.path || ''
        return rel.startsWith('books/') || abs.includes('\\books\\') || abs.includes('/books/')
      }

      md.render = (src, env = {}) => {
        if (isBookPath(env)) {
          return defaultRender(stripHtmlOutsideCode(src), env)
        }
        return defaultRender(src, env)
      }

      const defaultHtmlBlock = md.renderer.rules.html_block
      const defaultHtmlInline = md.renderer.rules.html_inline

      md.renderer.rules.html_block = (tokens, idx, options, env, self) => {
        if (isBookPath(env)) {
          return md.utils.escapeHtml(tokens[idx].content)
        }
        return defaultHtmlBlock
          ? defaultHtmlBlock(tokens, idx, options, env, self)
          : tokens[idx].content
      }

      md.renderer.rules.html_inline = (tokens, idx, options, env, self) => {
        if (isBookPath(env)) {
          return md.utils.escapeHtml(tokens[idx].content)
        }
        return defaultHtmlInline
          ? defaultHtmlInline(tokens, idx, options, env, self)
          : tokens[idx].content
      }

      const defaultImage = md.renderer.rules.image
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const src = token.attrGet('src') || ''
        const decoded = decodeEntities(src)
        if (decoded !== src) token.attrSet('src', decoded)
        token.attrSet('loading', 'lazy')
        token.attrSet('referrerpolicy', 'no-referrer')
        return defaultImage
          ? defaultImage(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options)
      }
    }
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: '电子书',
        items: books.map((book) => ({ text: book.title, link: `/books/${book.slug}/` }))
      },
      { text: 'PDF 阅读', link: '/pdf-viewer/' }
    ],
    sidebar,
    outline: [2, 3],
    docFooter: {
      prev: '上一章',
      next: '下一章'
    }
  }
}
