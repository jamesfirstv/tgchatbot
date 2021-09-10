//**********
/// Коллекция полезных для движка метематических функций и функций форматирования
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var math = {}

/// Уникализирует массив
math.uniq = function (arr) {
  return arr.filter((value, index, self) => { 
    return self.indexOf(value) === index
  })
}

/// Клонирует объектное дерево
math.clone = function (inp) {
  switch (typeof inp) {
    case 'boolean': return Boolean(inp)
    case 'number':  return Number(inp)
    case 'string':  return String(inp)
    case 'object':
      let out = {}
      for (let i in inp) out[i] = math.clone(inp[i])
      return out
    default:        return false
  }
}

/// Нумерует и сохраниет элементы объекта/массива в массив
/// Внимание! Теряются названия свойств объекта
math.obj2arr = function (obj) {
  let i = 0; let arr = []
  for (let j in obj) {
    arr[i] = obj[j]
    i++
  }
  return arr
}

/// Округляет вверх
math.rndUp = function (x) {
  let y = Math.floor(x)
  if (x == y) return x
  else return y+1
}

/// Преобразует текстовые строки с точками или запятыми во float
math.toNum = function (str) {
  str = str.trim()
  if (!str.match(/^[0-9.,]+$/g)) return NaN
  let tmp = str.match(/[.,]/g)
  if (tmp) if (tmp.length > 1) return NaN
  if (str.search(',') == -1) {
    return Number(str)
  } else {
    tmp = str.split(',')
    return Number(tmp[0]) + Number(tmp[1])/Math.pow(10, tmp[1].length)
  }
}

/// Приводит цифры к многозначным числам с ведущими нулями, согласно степени pow
/// math.addZero(7, 3) == '007'; math.addZero(123, 2) == '123'
math.addZero = function (num, pow=2) {
  let numD = 0
  while (num > Math.pow(10, numD)) numD++
  if (pow <= numD) return num
  let str = ''
  for (let i=0; i<pow-numD; i++) str += '0'
  return str+num
}

/// Возвращает дату в формате ГГГГ-ММ-ДД, или относительно переданной метки времени Unix
math.getDate = function (ts='now') {
  let d = new Date(ts)
  return d.getFullYear()+'-'+math.addZero(d.getMonth()+1)+'-'+math.addZero(d.getDate())
}

/// Возвращает время в формате ЧЧ:ММ, или относительно переданной метки времени Unix
math.getTime = function (ts='now') {
  let d = new Date(ts)
  return math.addZero(d.getHours())+':'+math.addZero(d.getMinutes())
}

/// Экранирует '_', '*' и '`' обратными слэшами
math.strEsc = function (str) {
  str = replace(str, '_')
  str = replace(str, '*')
  str = replace(str, '`')
  return str

  function replace(str, sym) {
    let arr = str.split(sym)
    str = arr[0]
    for (let i=1; i<arr.length; i++) str += '\\'+sym+arr[i]
    return str
  }
}

/// Проверяет корректность Markdown разметки
math.chkMarkdown = function (str) {
  if (!chkSym(str, '_')) return false
  if (!chkSym(str, '*')) return false
  if (!chkSym(str, '`')) return false
  return true

  function chkSym(str, sym) {
    let arr = str.split(sym)
    if (arr.length%2) return false
    return true
  }
}

/// Удаляет Markdown разметку
math.rmMarkdown = function (str) {
  str = rmSym(str, '_')
  str = rmSym(str, '*')
  str = rmSym(str, '`')
  return str

  function rmSym(str, sym) {
    let arr = str.split(sym)
    let ans = ''
    if (arr.length % 2) for (let i in arr) ans += arr[i]
    else {
      let num = arr.length/2
      for (let i=0; i<num; i++) ans += arr[i]
      ans += '\\'+sym
      for (let i=0; i<num; i++) ans += arr[i]
    }
    return ans
  }
}

module.exports = math
