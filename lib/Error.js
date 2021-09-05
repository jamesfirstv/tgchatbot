//**********
/// Класс ошибок
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var myError = class extends Error {
  constructor (g, msg) {
    g.log.err(msg)
    super(msg)
  }
}

module.exports = myError
