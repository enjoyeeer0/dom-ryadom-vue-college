import { readFileSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const distPath = resolve('dist')
let html = await readFile(resolve(distPath, 'index.html'), 'utf8')

function embedImages(content) {
  return content.replace(/\/photos\/([\w-]+\.jpg)/g, (_match, filename) => {
    const bytes = readFileSync(resolve(distPath, 'photos', filename))
    return `data:image/jpeg;base64,${bytes.toString('base64')}`
  })
}

const scriptMatch = html.match(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*><\/script>/)
const styleMatch = html.match(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/)

if (!scriptMatch || !styleMatch) {
  throw new Error('В собранной странице не найдены файлы приложения и стилей')
}

const scriptPath = resolve(distPath, scriptMatch[1].replace(/^\/+/, ''))
const stylePath = resolve(distPath, styleMatch[1].replace(/^\/+/, ''))
const script = embedImages(await readFile(scriptPath, 'utf8'))
const style = embedImages(await readFile(stylePath, 'utf8'))

html = html.replace(scriptMatch[0], () => `<script type="module">${script}</script>`)
html = html.replace(styleMatch[0], () => `<style>${style}</style>`)

const remainingFiles = [...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="\/?(?:assets|photos)\/[^"]+"/g)]
if (remainingFiles.length) {
  throw new Error(`В офлайн-файле остались ссылки на внешние файлы: ${remainingFiles.map(([match]) => match).join(', ')}`)
}

const outputPath = resolve('Открыть_без_интернета.html')
await writeFile(outputPath, html, 'utf8')
console.log(`Офлайн-версия готова: ${outputPath}`)
