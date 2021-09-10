//**********
/// Коллекция функций для работы с сетью Telegram
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var ton = {}
ton.TelegrafLib = require('telegraf') // Библиотека Telegraf как драйвер к Телеграму
ton.telTypes = [    // Подтипы сообщений от сети Телеграм через библиотеку Telegraf, поддерживаемых нами
  'callback_query', // Тип для прожатия инлайн-кнопки
  // 'message',     // Тип сообщений в общем виде
  'text',           // Подтип текстового сообщения
  'photo',          // Подтип фото
  'sticker',        // Подтип стикера
  'audio',          // Подтип аудио
  'voice',          // Подтип войса
  'video',          // Подтип видео
  'video_note',     // Подтип круглого видео
  'animation',      // Подтип гифки
  // 'document',    // Подтип файла (закомментирован из-за недостаточности тестов)
  // 'contact',     // Подтип контакта (закомментирован из-за недостаточности тестов)
  // 'location',    // Подтип локации (закомментирован из-за недостаточности тестов)
  // 'venue',       // Подтип точки сбора (закомментирован из-за недостаточности тестов)
  'forward_date'    // Подтип пересланного контента TODO: протестировать
]

/// Проверочная функция токена
///
/// @param g глобальный реестр переменных движка
ton.tokChk = function (g) {
  function throwErr() {
    throw new g.l.Error(g, g.lang.tgchatbot.ton['tokChk'])
  }

  // Комплексная проверка
  if (typeof(g.config.config_json.defToken) != 'string') throwErr()
  let pts = g.config.config_json.defToken.split(':')
  if (pts.length != 2) throwErr()
  if (!Number(pts[0])) throwErr()
  if (!pts[1].match(/^[a-z0-9]{30,70}$/i)) throwErr()

  // Сохранение
  g.config.defToken = g.config.config_json.defToken
}

/// Функция подключения к сети Телеграм, настройки Telegraf бота и его связки с
/// нашим объектом единого входа g.l.In()
///
/// @param g глобальный реестр переменных движка
ton.startBot = function (g) {
  function throwErr(e) {
    throw new g.l.Error(g, g.lang.tgchatbot.ton['start.err'] + e) // Не удалось подключиться к сети Телеграм
  }

  // Билдим Telegraf-бота
  let bot
  try {
    bot = new ton.TelegrafLib.Telegraf(g.config.defToken)
  } catch (e) {throwErr(e)}

  // Биндимся на все известные прерывания
  for (let i in ton.telTypes) bot.on(ton.telTypes[i], (ct) => {
    // Запуск сеанса, продолжение диалога с юзером
    let seans = new g.l.In(g, ct, ton.telTypes[i])
    seans.go()
  })

  // Открываем коннект в ту или иную сторону
  let wh = g.config.webhook
  try {
    if (wh) { // С вебкрюком
      let tlsOptions = g.l.fs.readTls(g)
      if (wh.ca) // Настоящий сертификат
        bot.telegram.setWebhook('https://' + wh.domain + ':' + wh.port + '/' + wh.path)
      else // Самоподписанный сертификат
        bot.telegram.setWebhook('https://' + wh.domain + ':' + wh.port + '/' + wh.path, {source: wh.cert})
      bot.startWebhook('/' + wh.path, tlsOptions, wh.port)
    } else bot.launch() // Без вебкрюка
  } catch (e) {throwErr(e)}

  g.log.info(g.lang.tgchatbot.ton['start.ok']) // Успешное подключкние к сети Телеграм
  return bot
}

/// Функция остановки бота
/// @param g    глобальный реестр переменных движка
/// @param sig  полученный сигнал от ядра ОС
ton.stop = function (g, sig) {
  g.bot.stop(sig)
  g.bot = false
  g.log.info(g.lang.tgchatbot.ton['stop.1'] + sig + g.lang.tgchatbot.ton['stop.2'])
}

module.exports = ton
