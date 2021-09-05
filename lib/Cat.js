//**********
/// Класс каталога кнопок
///
/// Класс каталога кнопок - это разновидность клавиатуры с оганичениями по
/// ширине и высоте и возможностью перелистывания "кнопочных" страниц
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var Cat = class {
  /// Создаёт класс каталога кнопок
  ///
  /// @param g      глобальный реестр переменных движка
  /// @param ct     локальный контекст времени выполнения, контекст беседы
  /// @param msg    текст сообщения
  /// @param btnArr массив кнопок g.l.Btn() для автоматического отображения
  /// @param opts   объект с параметрами вида: {
  ///   bread:    хлебные крошки,
  ///   extraBtn: массив кнопок g.l.Btn() для отображения под основными страницами
  ///             для перелистывания (например, "< Назад" и "<< Отмена")
  /// }
  constructor (g, ct, msg, btnArr, opts = false) {
    throwErr() {
      throw new g.l.Error(g, g.lang.tgchatbot.Cat['constructor.2'])
    }

    // Проверка данных
    if (typeof msg != 'string')
      throw new g.l.Error(g, g.lang.tgchatbot.Cat['constructor.1'])

    if (!(btnArr instanceof Array)) throwErr()
    for (let i in btnArr)
      if (!(btnArr[i] instanceof g.l.Btn)) throwErr()

    if (opts) {
      if (typeof opts != 'object')
        throw new g.l.Error(g, g.lang.tgchatbot.Cat['constructor.3'])

      if (opts.bread && !(opts.bread instanceof g.l.Bread))
        throw new g.l.Error(g, g.lang.tgchatbot.Cat['constructor.4'])

      if (opts.extraBtn && !(opts.extraBtn instanceof Array)) throwErr()
      for (i in opts.extraBtn)
        if (!(opts.extraBtn[i] instanceof g.l.Btn)) throwErr()
    }

    // Сохранение настроек каталога
    this.g        = g
    this.ct       = ct
    this.settings = {
      msg:      msg,
      btnArr:   btnArr,
      bread:    opts.bread ? opts.bread : false,
      extraBtn: opts.extraBtn ? opts.extraBtn : false,
      curPg:    0
    }
  }

  /// Отрисовывает первое сообщение автоматической клавиатуры-каталога
  ///
  /// @param g  глобальный реестр переменных движка
  /// @param ct локальный контекст времени выполнения, контекст беседы
  go() {
    this.reDraw(this.g, this.ct, this.settings)
  }

  /// Перерисовывает нужную "кнопочную страницу"
  ///
  /// @param g        глобальный реестр переменных движка
  /// @param ct       локальный контекст времени выполнения, контекст беседы
  /// @param settings объект с настройками класса-каталога передаваемый через
  ///                 процедуры dpc под кнопками перелистывания: {
  ///   msg:      сообщение,
  ///   btnArr:   массив всех кнопок g.l.Btn() каталога,
  ///   bread:    хлебные крошки g.l.Bread(),
  ///   extraBtn: массив кнопок g.l.Btn() для отображения под основными страницами
  ///             для перелистывания (например, "< Назад" и "<< Отмена"),
  ///   curPg:    текущая страница
  /// }
  static reDraw(g, ct, settings) {
    // Рассчёт количества страниц с кнопками
    let pages = g.l.math.rndUp(settings.btnArr.length / g.config.kbdSize.w / g.config.kbdSize.h)

    // Определение кнопок на странице запрошенной через settings.curPg
    let win     = g.config.kbdSize.w * g.config.kbdSize.h
    let btnArr  = []
    for (
      let i = win * settings.curPg;
      (i < win * settings.curPg + win) && (i < settings.btnArr.length);
      i++
    ) btnArr.push(settings.btnArr[i])

    // Создание сетки клавиатуры из выделенных кнопок в btnArr
    let kbd   = []
    let line  = []
    for (i = 0; i < btnArr.length; i++) {
      line.push(btnArr[i])
      if (line.length == g.config.kbdSize.w) {
        kbd.push(line)
        line = []
      }
    }

    // Определение кнопок перелистывания
    line = []
    if (settings.curPg > 0) {
      // Существует кнопка перемотки каталога назад
      let set = g.l.math.clone(settings)
      set.curPg = set.curPg - 1
      line.push(new g.l.Btn(g, '<', g.l.Cat.reDraw, set))
    }

    if (pages > 1) // Существует кнопка-счётчик страниц
      line.push(new g.l.Btn(g, settings.curPg + '/' + pages, () => {}))

    if (settings.curPg < pages - 1) {
      // Существует кнопка перемотки каталога вперёд
      let set = g.l.math.clone(settings)
      set.curPg = set.curPg + 1
      line.push(new g.l.Btn(g, '>', g.l.Cat.reDraw, set))
    }
    kbd.push(line)

    // Добавление экстра кнопок (например, "< Назад" и "<< Отмена")
    if (settings.extraBtn) kbd.push(settings.extraBtn)

    // Очистка оперативной таблицы хэшэй
    g.l.d.rmDpc(g, ct)

    // Перерисовка сообщения
    g.l.d.msg(g, ct, settings.msg, {
      bread:  settings.bread,
      kbd:    new g.l.Kbd(g, ct, kbd)
    })
  }
}

module.exports = Cat
