const fs = require('fs')
const path = require('path')

// JSON.parse(fs.readFileSync('package.json')).locales
const cwd = process.cwd()
const dir_pkg = path.join(cwd, 'package.json')
const dir_locals = path.join(cwd, 'locales')
const locales = JSON.parse(fs.readFileSync(dir_pkg)).locales || ['en_US']

const current = () => process.env.LOCALE || process.env.LANG || locales[0]
const Langs = {}

// Create folder
try { fs.mkdirSync(dir_locals) } catch(e) {}

const read = _path => {
  let txt = fs.readFileSync(_path)
  return txt ? JSON.parse(txt) : {}
}

const write = (_path, json, async) => {
  let txt = !json ? '{}' : JSON.stringify(json, null, '  ')
  fs[async ? 'writeFile' : 'writeFileSync'](_path, txt, 'utf8')
}

const dump = () => {
  locales.forEach(lang => write(Langs[lang].dir, Langs[lang].data, true))
}

// Init cache
locales.forEach(lang => {
  let dir = path.join(dir_locals, lang + '.json')
  Langs[lang] = {
    dir,
    data: {}
  }
  !fs.existsSync(dir) ? write(dir) : Langs[lang].data = read(dir)
})

const debounce = {
  delay: 500,
  ts: 0
}

const set = key => {
  locales.forEach(lang => (Langs[lang].data[key] = key))
  let ts = new Date().getTime()
  if ( ts - debounce.ts <= debounce.delay ) return
  debounce.ts = ts
  setTimeout(dump, debounce.delay)
}

// key is templateString or normal string
const get = (string, ...values) => {
  let key = typeof string === 'string' ? string : string.map((v, i) => string[i] + (values[i] ? '{' + i + '}' : '')).join('')
  let translated = Langs[current()].data[key]
  if (!translated) set(key)
  return (translated || key).replace(/\{(\d+)\}/g, (s, k) => values[+k])
}

const i18n = {
  __: get
}

module.exports = i18n
