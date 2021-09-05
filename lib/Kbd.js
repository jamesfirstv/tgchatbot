//**********
/// Класс клавиатуры
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var Kbd = class {
  /// Создаёт объект клавиатуры (нижней или инлайн) и регистрирует необходимые
  /// g.l.DpcCall()
  ///
  /// @param g      глобальный реестр переменных движка
  /// @param ct     локальный контекст времени выполнения, контекст беседы
  /// @param btnArr массив строк массивов ячеек заполненных объектами g.l.Btn()
  /// @param botKbd нижняя клавиатура? По умолчанию false (инлайн клавиатура)
  constructor (g, ct, btnArr, botKbd=false) {
    throwErr() {
      throw new g.l.Error(g, g.lang.tgchatbot.Kbd['constructor'])
    }

    // Проверка входящего массива массивов кнопок
    if (!(btnArr instanceof Array)) throwErr()
    for (let i in btnArr) {
      if (!(btnArr[i] instanceof Array)) throwErr()
      for (let j in btnArr[i])
        if (!(btnArr[i][j] instanceof g.l.Btn)) throwErr()
    }
    this.g      = g
    this.ct     = ct
    this.btnArr = btnArr
    this.botKbd = botKbd

    // Рассчёт размеров клавиатуры
    this.height = btnArr.length
    this.width  = 0
    for (i in btnArr)
      if (btnArr[i].length > this.width)
        this.width = btnArr[i].length

    // Регистрация dpc
    for (i in btnArr)
      for (j in btnArr[i])
        if (botKbd)
          btnArr[i][j]._dpcIndex
            = g.l.dpc.addBotKbd(g, ct, btnArr[i][j].name, btnArr[i][j].dpc)
        else
          btnArr[i][j]._dpcHash
            = g.l.dpc.addHash(  g, ct, btnArr[i][j].dpc)
  }

  /// Возвращает разметку клавиатуры согласно API Телеграм
  ///
  /// @param mkp объект разметки поумолчанию вместо g.config.defMarkup
  function getMkp(mkp=false) {
    // Загрузка шаблона разметки поумолчанию
    let markup
    if (mkp) markup = mkp
    else markup = this.g.l.math.clone(this.g.config.defMarkup)

    // Сборка разметки TODO проверить корректность разметки
    let keyb
    if (this.botKbd) {
      markup.reply_markup = {keyboard: []}
      keyb = markup.reply_markup.keyboard
    } else {
      markup.reply_markup = {inline_keyboard: []}
      keyb = markup.reply_markup.inline_keyboard
    }
    for (let i in this.btnArr) {
      let line = []
      for (let j in this.btnArr[i])
        if (this.botKbd) line.push({text: this.btnArr[i][j].name})
        else line.push({
          text:           this.btnArr[i][j].name,
          callback_data:  this.btnArr[i][j]._dpcHash
        })
      keyb.push(line)
    }
    return markup
  }
}

module.exports = Kbd
