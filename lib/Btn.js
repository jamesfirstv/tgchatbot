//**********
/// Класс кнопки с коллбэком
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var Btn = class {
  /// Создаёт кнопку для дальнейшего формирования одной из клавиатур
  ///
  /// @param g      глобальный реестр переменных движка
  /// @param name   имя на кнопке
  /// @param func   функция для исполнения при нажатии
  /// @param optObj параметры к функции при нажатии
  constructor (g, name, func, optObj = {}) {
    if (typeof name != 'string')
      throw new g.l.Error(g, g.lang.tgchatbot.Btn['constructor'])

    this.g    = g
    this.name = name
    this.dpc  = new g.l.DpcCall(g, func, optObj)
  }
}

module.exports = Btn
