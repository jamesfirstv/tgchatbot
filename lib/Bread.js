//**********
/// Класс хлебных крошек
///
/// Хлебные крошки - это разновидность линейной клавиатуры на базе ссылок через
/// /start с параметром
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var Bread = class {
  /// Создаёт клавиатуру типа "хлебные крошки" и регистрирует необходимые
  /// g.l.DpcCall()
  ///
  /// @param g      глобальный реестр переменных движка
  /// @param ct     локальный контекст времени выполнения, контекст беседы
  /// @param btnArr массив объектов g.l.Btn()
  constructor (g, ct, btnArr) {
    function throwErr() {
      throw new g.l.Error(g, g.lang.tgchatbot.Bread['constructor'])
    }

    // Проверка входящего массива кнопок
    if (!(btnArr instanceof Array)) throwErr()
    for (let i in btnArr)
      if (!(btnArr[i] instanceof g.l.Btn)) throwErr()
    this.g      = g
    this.ct     = ct
    this.btnArr = btnArr
    this.length = btnArr.length

    // Регистрация dpc
    for (i in btnArr)
      btnArr[i]._dpcHash = g.l.dpc.addHash(g, ct, btnArr[i].dpc)
  }

  /// Возвращает разметку клавиатуры хлебных крошек (отформатированный кусок
  /// сообщения в разметке "Telegram Markdown" с ссылками вида "/start с
  /// параметром")
  getMkp () {
    if (this.btnArr.length < 1) return ''

    let breads = ''
    for (let i in this.btnArr) {
      breads += '[' + this.btnArr[i].name + ']'
      breads += '(' + this.g.config.botLink + '?start=' + this.btnArr[i]._dpcHash + ')'
      breads += ' > '
    }
    return breads.slice(0, -3)
  }
}

module.exports = Bread
