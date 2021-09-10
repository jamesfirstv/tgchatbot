//**********
/// Коллекция функций для работы с моделью хренения (четырьмя таблицами в ОЗУ)
/// функций отложенного вызова (Delayed Procedure Call = dpc)
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var dpc       = {}
var hashDb    = [] // Таблица хэшэй
var botKbdDb  = [] // Таблица кнопок нижней клавиатуры
var cmdDb     = [] // Таблица команд
var othDb     = [] // Таблица обработчиков прочего ввода

var hasher = require('object-hash') // Хэшировальщик

//---------------------------------------
// Функции для работы с оперативной таблицей отложенных процедур через хэши

/// Добавляет новую хэш-реакцию в таблицу хэшэй, возвращает хэш-строку
/// добавленной записи
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param dpc  объект отложенной процедуры для сохранения
/// @return хэш строка записи в таблице g.l.dpc.hashDb
dpc.addHash = function (g, ct, dpc) {
  if (!(dpc instanceof g.l.DpcCall))
    throw new g.l.Error(g, g.lang.tgchatbot.dpc['addHash'])

  let hash = hasher(Math.random(), {encoding: 'base64'})

  dpc.hashDb.push({
    ts:       new Date(),
    hash:     hash,
    user_id:  ct.from.user_id,
    dpc:      dpc
  })

  return hash
}

/// Очищает таблицу хэшэй для текущего юзера
///
/// @param g  глобальный реестр переменных движка
/// @param ct локальный контекст времени выполнения, контекст беседы
dpc.rmHash = function (g, ct) {
  for (let i in hashDb)
    if (hashDb[i].user_id == ct.from.user_id)
      delete hashDb[i]
}

/// Очищает таблицу хэшэй для всех юзеров по таймауту
///
/// @param g  глобальный реестр переменных движка
dpc.rmHashByTime = function (g) {
  for (let i in hashDb)
    if (new Date() - hashDb[i].ts > g.config.timeout)
      delete hashDb[i]
}

/// Проверяет наличие запрошенного хэша для текущего юзера и возвращает
/// g.l.DpcCall() или false
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param hash хэш-индекс сохранённой dpc
/// @return g.l.DpcCall() | false
dpc.getHash = function (g, ct, hash) {
  for (let i in hashDb)
    if ((hashDb[i].hash == hash) && (hashDb[i].user_id == ct.from.user_id))
      return hashDb[i].dpc
  return false
}
//---------------------------------------

//---------------------------------------
// Функции для работы с оперативной таблицей отложенных процедур нижней клавиатуры

/// Добавляет новую кнопку в таблицу нижней клавиатуры, возвращает индекс
/// добавленной записи
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param name имя на кнопке
/// @param dpc  объект отложенной процедуры для сохранения
/// @return индекс записи в таблице g.l.dpc.botKbdDb
dpc.addBotKbd = function (g, ct, name, dpc) {
  if (!(dpc instanceof g.l.DpcCall))
    throw new g.l.Error(g, g.lang.tgchatbot.dpc['addBotKbd'])

  let btn = {
    user_id:  ct.from.user_id,
    name:     name,
    dpc:      dpc
  }

  // Поиск имеющейся кнопки с указанным названием
  for (let i in dpc.botKbdDb) if (
    (botKbdDb[i].user_id == ct.from.user_id) &&
    (botKbdDb[i].name == name)
  ) {
    // Найдена, обновляем
    botKbdDb[i] = btn
    return i // И возвращаем индекс
  }

  // Не найдена, записываем новую и возвращаем индекс на 1 меньше, чем длина массива
  return botKbdDb.push(btn) - 1
}

/// Очищает таблицу кнопок нижней клавиатуры для текущего юзера
///
/// @param g  глобальный реестр переменных движка
/// @param ct локальный контекст времени выполнения, контекст беседы
dpc.rmBotKbd = function (g, ct) {
  for (let i in botKbdDb)
    if (botKbdDb[i].user_id == ct.from.user_id)
      delete botKbdDb[i]
}

/// Проверяет наличие запрошенной кнопки нижней клавиатуры и возвращает
/// g.l.DpcCall() или false
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param name искомое имя на кнопке
/// @return g.l.DpcCall() | false
dpc.getBotKbd = function (g, ct, name) {
  for (let i in botKbdDb)
    if ((botKbdDb[i].user_id == ct.from.user_id) && (botKbdDb[i].name == name))
      return botKbdDb[i].dpc
  return false
}
//---------------------------------------

//---------------------------------------
// Функции для работы с оперативной таблицей отложенных процедур через команды бота

/// Добавляет новую команду бота в таблицу
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param name имя команды бота
/// @param dpc  объект отложенной процедуры для сохранения
/// @return индекс записи в таблице g.l.dpc.cmdDb
dpc.addCmd = function (g, ct, name, dpc) {
  if (!(dpc instanceof g.l.DpcCall))
    throw new g.l.Error(g, g.lang.tgchatbot.dpc['addCmd'])

  let cmd = {
    user_id:  ct.from.user_id,
    name:     name,
    dpc:      dpc
  }

  // Поиск имеющейся команды с указанным названием
  for (let i in cmdDb)
    if ((cmdDb[i].user_id == ct.from.user_id) && (cmdDb[i].name == name)) {
    // Найдена, обновляем
    cmdDb[i] = cmd
    return i // И возвращаем индекс
  }

  // Не найдена, записываем новую и возвращаем индекс на 1 меньше, чем длина массива
  return cmdDb.push(cmd) - 1
}

/// Очищает таблицу команд бота для текущего юзера
///
/// @param g  глобальный реестр переменных движка
/// @param ct локальный контекст времени выполнения, контекст беседы
dpc.rmCmd = function (g, ct) {
  for (let i in dpc.cmdDb)
    if (cmdDb[i].user_id == ct.from.user_id)
      delete cmdDb[i]
}

/// Проверяет наличие запрошенной команды бота и возвращает g.l.DpcCall() или false
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param name искомое имя команды бота
/// @return g.l.DpcCall() | false
dpc.getCmd = function (g, ct, text) {
  for (let i in cmdDb)
    if ((cmdDb[i].user_id == ct.from.user_id) && (cmdDb[i].name == text))
      return cmdDb[i].dpc
  return false
}
//---------------------------------------

//---------------------------------------
// Функции для работы с оперативной таблицей отложенных процедур через обработку
// ввода юзера

/// Устанавливает обработчик прочих сообщений от юзера которые не команды, не
/// старт с параметром и не одна из клавитур
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param dpc  объект отложенной процедуры для сохранения
/// @return индекс записи в таблице g.l.dpc.othDb
dpc.setOth = function (g, ct, dpc) {
  if (!(dpc instanceof g.l.DpcCall))
    throw new g.l.Error(g, g.lang.tgchatbot.dpc['setOth'])

  let cmd = {
    user_id:  ct.from.user_id,
    dpc:      dpc
  }

  // Поиск имеющейся записи для данного юзера
  for (let i in othDb)
    if (othDb[i].user_id == ct.from.user_id) {
      // Найдена, обновляем
      othDb[i] = cmd
      return i
    }

  // Не найдена, записываем новую
  return othDb.push(cmd)
}

/// Очищает обработчик прочих сообщений юзера
///
/// @param g  глобальный реестр переменных движка
/// @param ct локальный контекст времени выполнения, контекст беседы
dpc.rmOth = function (g, ct) {
  // Поиск имеющейся записи для данного юзера
  for (let i in dpc.othDb)
    if (othDb[i].user_id == ct.from.user_id) {
      delete othDb[i]
      return
    }
}

/// Возвращает обработчик прочих сообщений юзера g.l.DpcCall() или false
///
/// @param g  глобальный реестр переменных движка
/// @param ct локальный контекст времени выполнения, контекст беседы
dpc.getOth = function (g, ct) {
  // Поиск имеющейся записи для данного юзера
  for (let i in othDb)
    if (othDb[i].user_id == ct.from.user_id)
      return othDb[i].dpc
  return false
}
//---------------------------------------

//---------------------------------------
// Функции передачи управления от объекта In() на соответствующую сюжетную функцию

/// Запуск hash-dpc
///
/// @param g  глобальный реестр переменных движка
/// @param ct локальный контекст времени выполнения, контекст беседы
/// @return возвращает результат работы запрошенной процедуры dpc
dpc.goHash = function (g, ct) {
  let dpcCall = dpc.getHash(g, ct, ct.storyPoint.hash)
  if (dpcCall) return dpcCall.go(g, ct)
  else {
    g.log.warn(g.lang.tgchatbot.dpc['goHash'])
    return false
  }
}

/// Запуск botKbd-dpc
///
/// @param g  глобальный реестр переменных движка
/// @param ct локальный контекст времени выполнения, контекст беседы
/// @return возвращает результат работы запрошенной процедуры dpc
dpc.goBotKbd = function (g, ct) {
  let dpcCall = dpc.getBotKbd(g, ct, ct.storyPoint.cmd)
  if (dpcCall) return dpcCall.go(g, ct)
  else {
    g.log.warn(g.lang.tgchatbot.dpc['goBotKbd'])
    return false
  }
}

/// Запуск cmd-dpc
///
/// @param g  глобальный реестр переменных движка
/// @param ct локальный контекст времени выполнения, контекст беседы
/// @return возвращает результат работы запрошенной процедуры dpc
dpc.goCmd = function (g, ct) {
  let dpcCall = dpc.getCmd(g, ct,
    ct.storyPoint.cmd.match(/^\/([a-z0-9_-]+)/i)[1]
  )
  if (dpcCall) return dpcCall.go(g, ct)
  else {
    g.log.warn(g.lang.tgchatbot.dpc['goCmd'])
    return false
  }
}

/// Запуск oth-dpc
///
/// @param g  глобальный реестр переменных движка
/// @param ct локальный контекст времени выполнения, контекст беседы
/// @return возвращает результат работы запрошенной процедуры dpc
dpc.goOth = function (g, ct) {
  let dpcCall = dpc.getOth(g, ct)
  if (dpcCall) return dpcCall.go(g, ct)
  else {
    g.log.warn(g.lang.tgchatbot.dpc['goOth'])
    return false
  }
}
//---------------------------------------

module.exports = dpc
