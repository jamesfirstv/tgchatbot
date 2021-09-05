//**********
/// Класс хранения "заряженной" (с параметрами) функции отложенного вызова
/// (Delayed Procedure Call = dpc)
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var DpcCall = class {
  /// Проверяет входящие данные
  ///
  /// @param g      глобальный реестр переменных движка
  /// @param func   отложенная функция
  /// @param optObj параметры к отложенной функции
  constructor(g, func, optObj = {}) {
    // Не найдена функция которую следует отложить через g.l.DpcCall
    if (!(func instanceof Function))
      throw new g.l.Error(g, g.lang.tgchatbot.DpcCall['constructor'])

    // Сохранение
    this.g      = g
    this.func   = func
    this.optObj = optObj
  }

  /// Выполняет сохранённый код
  ///
  /// @param g  глобальный реестр переменных движка
  /// @param ct локальный контекст времени выполнения, контекст беседы
  go(g, ct) {
    return this.func(g, ct, this.optObj)
  }
}

module.exports = DpcCall
