//**********
/// Коллекция функций используемых при возврате управления из сюжета в движок
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var d = {}

// TODO Назад-отмена
/// Отправляет или обновляет сообщение
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param msg  текст сообщения
/// @param opts объект с параметрами вида: {
///   bread:      хлебные крошки,
///   kbd:        клавиатура к сообщению,
///   defMarkup:  переопределение разметки поумолчанию
/// }
d.msg = function (g, ct, msg, opts = false) {
  // Проверка входных данных
  if (opts) {
    if (opts.bread      && !(opts.bread instanceof g.l.Bread))
      throw new g.l.Error(g, g.lang.tgchatbot.d['msg.1'])
    if (opts.kbd        && !(opts.kbd   instanceof g.l.Kbd))
      throw new g.l.Error(g, g.lang.tgchatbot.d['msg.2'])
    if (opts.defMarkup  && !(typeof opts.defMarkup == 'object'))
      throw new g.l.Error(g, g.lang.tgchatbot.d['msg.3'])
  }

  // Добавление хлебных крошек к сообщению
  if (opts.bread)
    msg = opts.bread.getMkp() + "\n\n" + msg

  // Генерация разметки сообщения из клавиатуры и одного из умолчаний
  let markup
  if (opts.kbd) {
    if (opts.defMarkup) markup = opts.kbd.getMkp(opts.defMarkup)
    else markup = opts.kbd.getMkp()
  } else {
    if (opts.defMarkup) markup = opts.defMarkup
    else markup = g.l.math.clone(g.config.defMarkup)
  }

  // Отправка или обновление сообщения TODO проверить правильность переменных в контексте
  if ($.chat.id == $.from.id) // Сообщение пришло от юзера, а не от нас - отсылаем заново
    return g.bot.TelegrafCt.telegram.sendMessage(     ct.chat.id,                     msg, markup)
  else
    return g.bot.TelegrafCt.telegram.editMessageText( ct.chat.id, ct.chat.message_id, msg, markup)
}

/// Регистрирует ожидание текстового ответа пользователя
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param dpc  отложенная процедура для обработки ответа пользователя
/// @return индекс записи в таблице g.l.dpc.othDb
d.ans = function (g, ct, dpc) {
  return g.l.dpc.setOth(g, ct, dpc)
}

/// Регистрирует ожидание команды
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param name имя команды
/// @param dpc  отложенная процедура для обработки команды
/// @return индекс записи в таблице g.l.dpc.cmdDb
d.cmd = function (g, ct, name, dpc) {
  return g.l.dpc.addCmd(g, ct, name, dpc)
}

/// Очищает таблицы dpc
///
/// @param g    глобальный реестр переменных движка
/// @param ct   локальный контекст времени выполнения, контекст беседы
/// @param type какую именно из таблиц dpc следует очистить (hash | botKbd | cmd | oth | all)?
d.rmDpc = function (g, ct, type='hash') {
  switch (type) {
    case 'hash': default: g.l.dpc.rmHash(g, ct)   return
    case 'botKbd':        g.l.dpc.rmBotKbd(g, ct) return
    case 'cmd':           g.l.dpc.rmCmd(g, ct)    return
    case 'oth':           g.l.dpc.rmOth(g, ct)    return
    case 'all':
      g.l.dpc.rmHash(g, ct)
      g.l.dpc.rmBotKbd(g, ct)
      g.l.dpc.rmCmd(g, ct)
      g.l.dpc.rmOth(g, ct)
      return
  }
}

module.exports = d
