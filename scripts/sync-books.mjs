import fs from 'fs'
import path from 'path'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const booksDir = path.join(docsDir, 'books')
const pdfDir = path.join(docsDir, 'public', 'pdf')
const mapPath = path.join(root, 'scripts', 'books-map.json')

const readFileSafe = (p) => {
  try {
    return fs.readFileSync(p, 'utf-8').replace(/^\uFEFF/, '')
  } catch {
    return ''
  }
}

const mapData = readFileSafe(mapPath)
const titleMap = mapData ? JSON.parse(mapData) : { books: {}, pdf: {} }

const extractTitle = (content) => {
  if (!content) return ''
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (fm) {
    const titleLine = fm[1].split('\n').find((line) => /^title\s*:/i.test(line))
    if (titleLine) {
      return titleLine.split(':').slice(1).join(':').trim().replace(/^"|"$/g, '')
    }
  }
  const h1 = content.match(/^#\s+(.+)$/m)
  return h1 ? h1[1].trim() : ''
}

const listBookDirs = () => {
  if (!fs.existsSync(booksDir)) return []
  return fs
    .readdirSync(booksDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
}

const displayPdfTitle = (name) => {
  const mapped = titleMap.pdf?.[name]
  const raw = mapped || name
  return raw.replace(/\.pdf$/i, '')
}

const books = listBookDirs()
  .map((slug) => {
    const indexPath = path.join(booksDir, slug, 'index.md')
    const content = readFileSafe(indexPath)
    const title = titleMap.books?.[slug] || extractTitle(content) || slug
    return { slug, title }
  })
  .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))

const pdfs = fs.existsSync(pdfDir)
  ? fs
      .readdirSync(pdfDir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.toLowerCase().endsWith('.pdf'))
      .map((d) => d.name)
      .sort((a, b) => a.localeCompare(b, 'zh-CN'))
  : []

const replaceBetween = (content, start, end, replacement) => {
  const pattern = new RegExp(`(${start})([\\s\\S]*?)(${end})`, 'm')
  if (!pattern.test(content)) return content
  return content.replace(pattern, `$1\n${replacement}\n$3`)
}

// Update config.ts
const configPath = path.join(docsDir, '.vitepress', 'config.ts')
let configContent = readFileSafe(configPath)
if (configContent) {
  const bookLines = books
    .map((b) => `  { slug: '${b.slug}', title: '${b.title}' },`)
    .join('\n')
  configContent = replaceBetween(configContent, '// AUTO-BOOKS-START', '// AUTO-BOOKS-END', bookLines)
  fs.writeFileSync(configPath, configContent, 'utf-8')
}

// Update docs/index.md
const indexPath = path.join(docsDir, 'index.md')
let indexContent = readFileSafe(indexPath)
if (indexContent) {
  const mdCards = books
    .map(
      (b) => `    <a class="book-card" href="books/${b.slug}/">\n      <h3>${b.title}</h3>\n      <p>Markdown 书籍</p>\n    </a>`
    )
    .join('\n')

  const pdfCards = pdfs
    .map(
      (name) =>
        `    <a class="book-card pdf" href="pdf-viewer/?file=pdf/${encodeURIComponent(name)}">\n      <h3>${displayPdfTitle(name)}</h3>\n      <p>PDF 版在线阅读</p>\n    </a>`
    )
    .join('\n')

  indexContent = replaceBetween(indexContent, '<!-- AUTO-MD-LIST-START -->', '<!-- AUTO-MD-LIST-END -->', mdCards)
  indexContent = replaceBetween(indexContent, '<!-- AUTO-PDF-LIST-START -->', '<!-- AUTO-PDF-LIST-END -->', pdfCards)
  fs.writeFileSync(indexPath, indexContent, 'utf-8')
}

// Update docs/pdf-viewer/index.md
const pdfIndexPath = path.join(docsDir, 'pdf-viewer', 'index.md')
let pdfIndexContent = readFileSafe(pdfIndexPath)
if (pdfIndexContent) {
  const pdfLinks = pdfs
    .map((name) => `- [${displayPdfTitle(name)}](./?file=pdf/${encodeURIComponent(name)})`)
    .join('\n')
  pdfIndexContent = replaceBetween(
    pdfIndexContent,
    '<!-- AUTO-PDF-LINKS-START -->',
    '<!-- AUTO-PDF-LINKS-END -->',
    pdfLinks
  )
  fs.writeFileSync(pdfIndexPath, pdfIndexContent, 'utf-8')
}

console.log(`Synced ${books.length} markdown books and ${pdfs.length} PDFs.`)
