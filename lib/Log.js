//**********
/// Класс логгера
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var Log = class {
  constructor (g) {
    this.g = g
    this.Log4js = require('log4js')
    this.Log4js.configure({
      appenders: {access: {type: 'file', filename: 'access.log'}},
      categories: {default: {appenders: ['access'], level: 'trace'}}
    })
    this.log = this.Log4js.getLogger('access')
    this.err = this.error
  }

  error(msg) {
    if (this.g.config.conlogs) console.log('Err: ' + msg)
    if (this.g.config.logs) this.log.error(msg)
  }

  warn(msg) {
    if (this.g.config.conlogs) console.log('Warn: ' + msg)
    if (this.g.config.logs) this.log.warn(msg)
  }

  info(msg) {
    if (this.g.config.conlogs) console.log('Info: ' + msg)
    if (this.g.config.logs) this.log.info(msg)
  }
}

module.exports = Log
