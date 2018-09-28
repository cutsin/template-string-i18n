const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

const cwd = process.cwd()
const dir_pkg = path.join(cwd, 'package.json')
const dir_locals = path.join(cwd, 'languages')
const languages = JSON.parse(fs.readFileSync(dir_pkg, 'utf8')).languages || ['en-US']

const Cache = {}

// Create folder
try { fs.mkdirSync(dir_locals) } catch(e) {}
// Watch files changes
chokidar.watch(dir_locals, { ignoreInitial: true, usePolling: true, persistent: false })
  .on('change', function(fullname, stats){
    load(path.basename(fullname).split('.')[0])
  })

const read = _path => JSON.parse(fs.readFileSync(_path, 'utf8') || '{}')
const writeQueue = {}
const write = (_path, json) => {
  writeQueue[_path] || (writeQueue[_path] = {lock: false, data: []})
  if (json) writeQueue[_path].data.push(JSON.stringify(json, null, '  '))
  if (writeQueue[_path].lock) return
  writeQueue[_path].lock = true
  fs.writeFile(_path, writeQueue[_path].data.shift(), err => {
    writeQueue[_path].lock = false
    if (writeQueue[_path].data.length) write(_path)
  })
}

const load = lang => {
  let dir = path.join(dir_locals, lang + '.json')
  Cache[lang] || ( Cache[lang] = { dir, data: {} } )
  // Just write if file is missing
  if (!fs.existsSync(dir)) {
    write(dir, '{}')
    languages.push(lang)
  } else {
    // Simple merge from local file
    const src = read(dir)
    for(k in src) {
      Cache[lang].data[k] = src[k]
    }
  }
  return Cache[lang]
}

// Init Cache
languages.forEach(lang => load(lang))

const format = i => '{' + i + '}'

// Dump to file
const dump = () => {
  languages.forEach(lang => {
    load(lang)  // Load first
    write(Cache[lang].dir, Cache[lang].data)
  })
}

const set = key => {
  languages.forEach(lang => (Cache[lang].data[key] = key))
  dump()
  return key
}

// key is templateString or normal string
const get = (str, ...values) => {
  const lang = process.env.LOCALE || process.env.LANG || languages[0]
  let langTrans = Cache[lang]
  if (!langTrans) langTrans = load(lang)
  const isString = typeof str === 'string'
  let key = isString ? str : str.map((v, i) => str[i] + (values[i] ? format(i) : '')).join('')
  let translated = langTrans.data[key]
  if (!translated) translated = set(key)
  return isString ? translated : translated.replace(/\{(\d+)\}/g, (s, k) => values[+k])
}

const i18n = {
  __: get,
  format
}

module.exports = i18n
