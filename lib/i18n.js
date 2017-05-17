const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

// JSON.parse(fs.readFileSync('package.json')).locales
const cwd = process.cwd()
const dir_pkg = path.join(cwd, 'package.json')
const dir_locals = path.join(cwd, 'locales')
const locales = JSON.parse(fs.readFileSync(dir_pkg)).locales || ['en_US']

const current = () => process.env.LOCALE || process.env.LANG || locales[0]
const Cache = {}

// Create folder
try { fs.mkdirSync(dir_locals) } catch(e) {}
// Watch files changes
chokidar.watch(dir_locals, { ignoreInitial: true, usePolling: true })
  .on('change', function(fullname, stats){
    load(path.basename(fullname).split('.')[0])
  })

const read = _path => JSON.parse(fs.readFileSync(_path) || '{}')
const write = (_path, json, async) => {
  let txt = !json ? '{}' : JSON.stringify(json, null, '  ')
  fs[async ? 'writeFile' : 'writeFileSync'](_path, txt, 'utf8')
}

const load = lang => {
  let dir = path.join(dir_locals, lang + '.json')
  Cache[lang] || ( Cache[lang] = { dir, data: {} } )
  // Just write if file is missing
  if (!fs.existsSync(dir)) return write(dir)
  // Simple merge from local file
  const src = read(dir)
  for(k in src) {
    Cache[lang].data[k] = src[k]
  }
}

// Init Cache
locales.forEach(lang => load(lang))

// Dump to file
const dump = () => {
  locales.forEach(lang => {
    load(lang)  // Load first
    write(Cache[lang].dir, Cache[lang].data, true)
  })
}

const set = key => {
  locales.forEach(lang => (Cache[lang].data[key] = key))
  dump()
}

// key is templateString or normal string
const get = (string, ...values) => {
  let key = typeof string === 'string' ? string : string.map((v, i) => string[i] + (values[i] ? '{' + i + '}' : '')).join('')
  let translated = Cache[current()].data[key]
  if (!translated) set(key)
  return (translated || key).replace(/\{(\d+)\}/g, (s, k) => values[+k])
}

const i18n = {
  __: get
}

module.exports = i18n
