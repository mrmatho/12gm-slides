import { DIAGRAM_TYPES } from './diagrams.js'
import { EXAMPLES } from './examples.js'

const typeSelect = document.getElementById('type-select')
const editor = document.getElementById('editor')
const errorBox = document.getElementById('error-box')
const preview = document.getElementById('preview')
const downloadSvgBtn = document.getElementById('download-svg')
const downloadPngBtn = document.getElementById('download-png')
const pngScale = document.getElementById('png-scale')
const resetBtn = document.getElementById('reset-example')

const PAD = 16
const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

// Per-type editor contents persist across tab switches so flipping types doesn't lose edits.
const state = {}
for (const key of Object.keys(DIAGRAM_TYPES)) state[key] = EXAMPLES[key]

let currentSvgMarkup = ''
let currentWidth = 0
let currentHeight = 0

function currentType() {
  return typeSelect.value
}

function buildSvgMarkup(width, height, inner) {
  const w = width + PAD * 2
  const h = height + PAD * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family='${FONT_STACK}'>` +
    `<rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff" />` +
    `<g transform="translate(${PAD}, ${PAD})">${inner}</g>` +
    `</svg>`
}

function render() {
  const type = currentType()
  const raw = editor.value
  state[type] = raw

  let props
  try {
    props = raw.trim() ? JSON.parse(raw) : {}
  } catch (err) {
    errorBox.textContent = `Invalid JSON: ${err.message}`
    errorBox.hidden = false
    return
  }

  let result
  try {
    result = DIAGRAM_TYPES[type].render(props)
  } catch (err) {
    errorBox.textContent = `Could not render diagram: ${err.message}`
    errorBox.hidden = false
    return
  }

  errorBox.hidden = true
  currentWidth = result.width + PAD * 2
  currentHeight = result.height + PAD * 2
  currentSvgMarkup = buildSvgMarkup(result.width, result.height, result.svg)
  preview.innerHTML = currentSvgMarkup
  const svgEl = preview.querySelector('svg')
  svgEl.style.width = '100%'
  svgEl.style.height = 'auto'
  svgEl.style.maxWidth = Math.min(currentWidth, 720) + 'px'
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function downloadSvg() {
  if (!currentSvgMarkup) return
  const blob = new Blob([currentSvgMarkup], { type: 'image/svg+xml' })
  downloadBlob(blob, `${currentType()}-diagram.svg`)
}

function downloadPng() {
  if (!currentSvgMarkup) return
  const scale = Number(pngScale.value) || 2
  const svgBlob = new Blob([currentSvgMarkup], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = currentWidth * scale
    canvas.height = currentHeight * scale
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    canvas.toBlob(blob => downloadBlob(blob, `${currentType()}-diagram.png`), 'image/png')
  }
  img.onerror = () => {
    URL.revokeObjectURL(url)
    errorBox.textContent = 'Could not rasterize the diagram to PNG.'
    errorBox.hidden = false
  }
  img.src = url
}

function selectType(type) {
  typeSelect.value = type
  editor.value = state[type]
  render()
}

typeSelect.addEventListener('change', () => selectType(typeSelect.value))
editor.addEventListener('input', render)
downloadSvgBtn.addEventListener('click', downloadSvg)
downloadPngBtn.addEventListener('click', downloadPng)
resetBtn.addEventListener('click', () => {
  state[currentType()] = EXAMPLES[currentType()]
  editor.value = EXAMPLES[currentType()]
  render()
})

selectType(typeSelect.value)
