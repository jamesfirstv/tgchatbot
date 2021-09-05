//**********
/// Объект In() - единая унифицированная точка входа сообщений от Телеграма
///
/// Опираясь на этот объект, движок пытается:
/// 1) Сформировать объект контекста для функций сюжета в модулях из папки mod
/// 2) Классифицировать поступающие сообщения от Телеграмма как часть сюжета
/// некоего диалога с пользователем и определить точку нахождения юзера в сюжете
/// диалога (ct.storyPoint)
/// То есть, этот объект является: "роутером входящих событий" и "скриптом
/// подготовки контекста"
///
/// Когда вызывается конструктор этого объекта, то это уже одна из реакций
/// юзера, переданная нам через Телеграм и захваченная библиотекой Telegraf.
/// Контекст времени выполнения отсюда и далее - процесс диалога с юзером
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var In = class {
//---------------------------------------
// Функции конструктора: собирают контекст, определяются с направлением поиска
// текущей позиции юзера в сюжете диалогов

  /// Конструктор-роутер
  ///
  /// @param g    глобальный реестр переменных движка
  /// @param ct   локальный контекст времени выполнения, контекст беседы
  /// @param type субтип обновления от библиотеки Telegraf
  constructor(g, ct, type) {
    this.g = g
    this.TelegrafCt = ct
    let ctm = ct.update.message

    // Очистка хэшэй по таймауту (сборка мусора)
    g.l.dpc.rmHashByTime(g)

    // Создание контекста для функций сюжета в модулях из папки mod
    this.context = this.ct = {
      type:         type,
      story:        false,
      storyPoint:   false,
      from:         ctm.from,
      chat:         ctm.chat,
      forward_date: ctm.forward_date  ? ctm.forward_date  : false,
      forward_from: ctm.forward_from  ? ctm.forward_from  : false,
      text:         ctm.text          ? ctm.text          : false,
      photo:        ctm.photo         ? ctm.photo         : false,
      sticker:      ctm.sticker       ? ctm.sticker       : false,
      audio:        ctm.audio         ? ctm.audio         : false,
      voice:        ctm.voice         ? ctm.voice         : false,
      video:        ctm.video         ? ctm.video         : false,
      video_note:   ctm.video_note    ? ctm.video_note    : false,
      animation:    ctm.animation     ? ctm.animation     : false,
      document:     ctm.document      ? ctm.document      : false,
      contact:      ctm.contact       ? ctm.contact       : false,
      location:     ctm.location      ? ctm.location      : false,
      venue:        ctm.venue         ? ctm.venue         : false
    }

    // Определение сюжета для данного юзера (ct.story)
    for (let i in g.config.priv) if (i == ct.from.user_id) {
      this.ct.story = g.config.priv[i]
      break
    }
    if (!this.ct.story) this.ct.story = g.config.defMod

    // Инициализация сюжета по необходимости
    if (!g.l.dpc.getCmd(g, this.ct, '/start'))
      g.m[this.ct.story].init(g, this.ct)

    // Определение точки в сюжете (ct.storyPoint)
    switch (type) {
      case 'callback_query':  this.con_call();   return
      case 'text':            this.con_text();   return
      case 'photo':           this.con_media();  return
      case 'sticker':         this.con_oth();    return
      case 'audio':           this.con_media();  return
      case 'voice':           this.con_media();  return
      case 'video':           this.con_media();  return
      case 'video_note':      this.con_oth();    return
      case 'animation':       this.con_media();  return
      case 'document':        this.con_media();  return
      case 'contact':         this.con_media();  return
      case 'location':        this.con_media();  return
      case 'venue':           this.con_media();  return
      default: throw new g.l.Error(g, g.lang.tgchatbot.In['constructor'] + type)
    }
  }

  // Пришёл коллбэк
  private con_call() {
    // TODO: протестировать
    this.ct.storyPoint = {type: 'hash', hash: this.TelegrafCt.update.message.callback_data}
  }

  // Пришёл текст
  private con_text() {
    // Текст - это команда
    if (this.ct.text.match(/^\/.+/)) {this.con_cmd(); return}
    // Текст - это кнопка нижней клавиатуры
    if (this.g.l.dpc.getBotKbd(this.g, this.ct, this.ct.text)) {
      this.ct.storyPoint = {type: 'botKbd', cmd: this.ct.text}; return
    }
    // Текст - сообщение прочего вида
    this.con_oth()
  }

  // Пришла мультимедиа
  private con_media() {
    // Выносим описание мультимедиа в свойство text
    if (this.ct[this.ct.type].description)
      this.ct.text = this.ct[this.ct.type].description
    // Рассматриваем как сообщение прочего вида
    this.con_oth()
  }

  // Пришла команда
  private con_cmd() {
    let cmd = this.ct.text.trim()
    // Команда - это /start (начало беседы)
    if (cmd.match(/^\/start$/i)) {
      g.m[this.ct.story].init(this.g, this.ct) // Перезагрузка сюжета
      this.ct.storyPoint = {type: 'cmd', cmd: '/start'}
      return
    }
    // Команда - это просто команда
    if (this.g.l.dpc.getCmd(this.g, this.ct, cmd.match(/^\/([a-z0-9_-]+)/i)[1])) {
      this.ct.storyPoint = {type: 'cmd', cmd: cmd}
      return
    }
    // Команда - это старт с параметром
    if (let m = cmd.match(/^\/start\s([a-z0-9]+==)$/i)) {
      this.ct.storyPoint = {type: 'hash', hash: m[1]}
      return
    }
    // Неизвестная команда, рассматриваем её как сообщение прочего вида
    this.con_oth()
  }

  // Пришло сообщение прочего вида
  private con_oth() {
    this.ct.storyPoint = {type: 'oth'}
  }
//---------------------------------------

//---------------------------------------
  /// Метка времени последней негативной записи в логи о неготовности БД, чтобы
  /// не заспамливать лог
  static lastFail = false

  /// Функция раннера: запускает необходимую подсистему движка для поддержки диалога
  go() {
    // Проверка на готовность соединения с БД после асинхронного подключения
    if (typeof this.g.db != 'object') {
      if (new Date() - lastFail > 10000) {
        this.g.log.warn(this.g.lang.tgchatbot.In['go.dbFail'])
        lastFail = new Date()
      }
      // БД не готова - игнорируем сообщение Телеграма
      return false
    }

    // Запуск обработчика по типу
    switch (this.ct.storyPoint.type) {
      case 'hash': // Прожата инлайн кнопка
        return this.g.l.dpc.goHash(   this.g, this.ct)
      case 'botKbd': // Прожата кнопка нижней клавиатуры
        return this.g.l.dpc.goBotKbd( this.g, this.ct)
      case 'cmd': // Вызвана команда бота
        return this.g.l.dpc.goCmd(    this.g, this.ct)
      case 'oth': // Пользователь что-то ответил
        return this.g.l.dpc.goOth(    this.g, this.ct)
    }
  }
//---------------------------------------
}

module.exports = In
