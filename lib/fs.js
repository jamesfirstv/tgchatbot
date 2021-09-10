//**********
/// Коллекция функций для работы с файловой системой хостинга
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var fs = {}
var sysfs = require('fs')

/// Проверяет наличие папки
fs.dirExists = function (g, path) {
  if (!sysfs.existsSync(path)) return false
  return sysfs.statSync(path).isDirectory()
}

/// Проверяет наличие файла
fs.fileExists = function (g, path) {
  if (!sysfs.existsSync(path)) return false
  return sysfs.statSync(path).isFile()
}

/// Загружает конфигурационный файл
fs.loadConfig = function (g) {
  // Определяет путь до конфига
  let path = './config.json'
  for (let i in process.argv) {
    if (i == 0) continue
    if (process.argv[i].match(/^-c$/)) {
      if (!process.argv[i+1]) break
      path = process.argv[i+1]
      break
    }
  }

  // Возвращает прочитанный конфиг
  return JSON.parse(fs.loadCJSON(g, path))
}

/// Загружает языковые файлы текущего языка из папки lang
fs.loadLang = function (g) {
  let lang = {}
  fs.readDir(g, 'lang/'+g.config.lang, (g, path) => {
    lang[path2nameLang(path)] = JSON.parse(fs.loadCJSON(g, path))
  }, /\.json$/g)
  return lang
}

/// Загружает все js (сюжетные модули) рекурсивно из папки mod
fs.loadMod = function (g) {
  let m = {}
  fs.readDir(g, 'mod', (g, path) => {
    m[path2name(path)] = require('../'+path)
  }, /\.js$/g)
  return m
}

/// Читает JSON с однострочными коментами из файловой системы и отрезает их,
/// возвращая файловую строку как readFileSync()
fs.loadCJSON = function (g, path) {
  let str = sysfs.readFileSync(path, {encoding: 'utf8'}).split("\n")
  let file = ''
  for (let i in str) file += str[i].split('///')[0]+"\n"
  return file
}

/// Рекурсивно читает содержимое папки, после чего вызывает cb(g, path)
/// для каждого файла подходящего под маску re. Полезно чтобы перебрать папку и
/// отдать коллбэку все файлы одного типа
fs.readDir = function (g, path, cb, re=/.*/) {
  let files = sysfs.readdirSync(path)
  for (let i in files) {
    let np = path+'/'+files[i]
    let fd = sysfs.openSync(np, 'r')
    let stat = sysfs.fstatSync(fd)
    if (stat.isDirectory()) fs.readDir(g, np, cb, re)
    if (stat.isFile()) if (files[i].match(re)) cb(g, np)
    sysfs.closeSync(fd)
  }
}

/// Читает файлы ключей и возвращает TLS объект для создания веб-крюка
/// На момент вызова этой функции из g.l.ton.startBot() наличие файлов
/// сертификатов уже проверено через Config.hookChk()
fs.readTls = function (g) {
  if (g.config.webhook.ca) {return {
    key:  sysfs.readFileSync(g.config.webhook.key),
    cert: sysfs.readFileSync(g.config.webhook.cert),
    ca:   [sysfs.readFileSync(g.config.webhook.ca)]
  }} else {return {
    key:  sysfs.readFileSync(g.config.webhook.key),
    cert: sysfs.readFileSync(g.config.webhook.cert)
  }}
}

/// Преобразует файловые пути в имена языковых массивов
function path2nameLang(path) {
  let pts = path2name(path).split('_')
  let name = ''
  for (let i=1; i<pts.length; i++) name += pts[i]+'_'
  return name.substr(0, name.length-1)
}

/// Преобразует файловые пути в имена "dir/file" -> "dir_file"
function path2name(path) {
  let pts = path.split('/')
  let pts2 = pts[pts.length-1].split('.')
  if (pts2.length > 1) {
    let tmp = ''
    for (let i=0; i<pts2.length-1; i++) tmp += pts2[i]+'.'
    tmp = tmp.substr(0, tmp.length-1)
    pts[pts.length-1] = tmp
  }
  let name = ''
  for (let i=1; i<pts.length; i++) name += pts[i]+'_'
  return name.substr(0, name.length-1)
}

module.exports = fs
