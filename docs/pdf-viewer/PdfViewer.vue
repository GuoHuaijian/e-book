<template>
  <section class="pdf-viewer">
    <div class="toolbar">
      <div class="file-info">
        当前文件：<code>{{ displayFile }}</code>
      </div>
      <div class="tool-group">
        <a class="btn" :href="viewerUrl" target="_blank" rel="noopener">打开阅读器</a>
        <a class="btn ghost" :href="fileUrl" target="_blank" rel="noopener">打开 PDF</a>
      </div>
    </div>

    <div class="hero">
      <div class="hero-title">PDF 阅读</div>
      <div class="hero-desc">阅读器将在新窗口打开，避免覆盖当前页面。</div>
      <div class="hero-actions">
        <a class="btn" :href="viewerUrl" target="_blank" rel="noopener">开始阅读</a>
        <a class="btn ghost" :href="fileUrl" target="_blank" rel="noopener">下载</a>
      </div>
    </div>

    <div class="hint">
      通过 URL 参数指定 PDF：
      <code>pdf-viewer/?file=/pdf/高性能mysql第三版.pdf</code>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, withBase } from 'vitepress'

const route = useRoute()

const defaultFile = 'pdf/高性能mysql第三版.pdf'
const fileParam = ref(defaultFile)

const readFileParam = () => {
  if (typeof window === 'undefined') return defaultFile
  const params = new URLSearchParams(window.location.search)
  const raw = params.get('file')
  if (!raw) return defaultFile
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

const fileUrl = computed(() => {
  const file = fileParam.value
  if (/^https?:\/\//i.test(file)) return encodeURI(file)
  const normalized = file.startsWith('/') ? file : `/${file}`
  return encodeURI(withBase(normalized))
})

const viewerUrl = computed(() => {
  const viewerPath = withBase('/pdfjs/web/viewer.html')
  return `${viewerPath}?file=${encodeURIComponent(fileUrl.value)}`
})

const displayFile = computed(() => fileParam.value)

const updateFile = () => {
  fileParam.value = readFileParam()
}

updateFile()
watch(() => route.path, () => updateFile())
watch(() => route.hash, () => updateFile())
</script>

<style scoped>
.pdf-viewer {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
}

.file-info {
  font-size: 13px;
  color: #0f172a;
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn {
  background: #0f766e;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  transition: opacity 0.15s ease;
}

.btn.ghost {
  background: #e2f3f1;
  color: #0b5f57;
}

.hero {
  margin-top: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 14px;
  border-radius: 8px;
  color: #0f172a;
}

.hero-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.hero-desc {
  color: #64748b;
  font-size: 13px;
}

.hero-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: #475569;
}
</style>
