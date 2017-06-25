const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

const cwd = process.cwd()
const dir_pkg = path.join(cwd, 'package.json')
const dir_locals = path.join(cwd, 'languages')
const languages = JSON.parse(fs.readFileSync(dir_pkg, 'utf8')).languages || ['en-US']

const current = () => process.env.LANGUAGES || process.env.LOCALE || process.env.LANG || languages[0]
const Cache = {}

// Create folder
try { fs.mkdirSync(dir_locals) } catch(e) {}
// Watch files changes
chokidar.watch(dir_locals, { ignoreInitial: true, usePolling: true })
  .on('change', function(fullname, stats){
    load(path.basename(fullname).split('.')[0])
  })

const read = _path => JSON.parse(fs.readFileSync(_path, 'utf8') || '{}')
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
languages.forEach(lang => load(lang))

const format = i => '{' + i + '}'

// Dump to file
const dump = () => {
  languages.forEach(lang => {
    load(lang)  // Load first
    write(Cache[lang].dir, Cache[lang].data, true)
  })
}

const set = key => {
  languages.forEach(lang => (Cache[lang].data[key] = key))
  dump()
  return key
}

// key is templateString or normal string
const get = (str, ...values) => {
  const isString = typeof str === 'string'
  let key = isString ? str : str.map((v, i) => str[i] + (values[i] ? format(i) : '')).join('')
  let translated = Cache[current()].data[key]
  if (!translated) translated = set(key)
  return isString ? translated : translated.replace(/\{(\d+)\}/g, (s, k) => values[+k])
}

const i18n = {
  __: get,
  format
}

module.exports = i18n
