//**********
/// Класс конфигурации
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var Config = class {
  // Конструктор
  constructor (g, config) {
    // Определяем умолчания конфига (стартовые настройки)
    this.webhook    = false
    this.kbdSize    = {"w": "2", "h": "14"}
    this.lang       = 'ru'
    this.timeout    = 1000
    this.defMarkup  = {"parse_mode": "Markdown", "disable_web_page_preview": true}
    this.logs       = true
    this.conlogs    = true

    // Сохранияем загруженные данные из config.json
    this.g = g
    this.config_json = config
  }

  // Проверяет данные загруженные из config.json
  checkConfig(g) {
    this.botLinkCheck(g)
    g.l.ton.tokChk(g)
    g.l.db.dbChk(g)
    this.langChk(g)
    this.privChk(g)
    this.hookChk(g)
    this.kbdSizeChk(g)
    this.storiesChk(g)
    this.timeoutChk(g)
    this.markupChk(g)
    this.logChk(g)
  }

  // Проверяет переменную web-ссылки на бота
  botLinkCheck(g) {
    if (!this.config_json.botLink.match(/^https:\/\/t\.me\/[a-z0-9_]+$/i))
      throw new g.l.Error(g, g.lang.tgchatbot.Config['botLink'])
    this.botLink = this.config_json.botLink
  }

  // Проверяет переменную языка
  langChk(g) {
    if (!this.config_json.lang.match(/^[a-z]{2}$/i))
      throw new g.l.Error(g, g.lang.tgchatbot.Config['langChk.1'])
    if (
      !g.l.fs.dirExists(g, 'lang/' + this.config_json.lang) ||
      !g.l.fs.fileExists(g, 'lang/' + this.config_json.lang + '/tgchatbot.json')
    ) throw new g.l.Error(g, g.lang.tgchatbot.Config['langChk.2'] + this.config_json.lang)
    this.lang = this.config_json.lang
  }

  // Проверяет структуру массива привелегий
  privChk(g) {
    function throwErr() {
      throw new g.l.Error(g, g.lang.tgchatbot.Config['privChk'])
    }

    if (typeof this.config_json.priv == 'object') {
      for (let i in this.config_json.priv) if (!(
        (typeof i == 'string') &&
        (i.match(/^[0-9]+$/)) &&
        (typeof this.config_json.priv[i] == 'string')
      )) {
        throwErr()
      }
    } else throwErr()
  }

  // Проверяет объект настроек веб-крюка и наличие файлов сертификатов
  // "webhook": {
  //  "domain": "test.org",
  //  "port":   "8443",
  //  "path":   "secret/path.html",
  //  "key":    "key.pem",
  //  "cert":   "cert.pem",
  //  "ca":     "ca.pem" // или false для несамоподписанных настоящих сертификатов
  // }
  hookChk(g) {
    function throwSyntaxErr() {
      throw new g.l.Error(g, g.lang.tgchatbot.Config['hookChk.syntax'])
    }

    function throwFileErr(file) {
      throw new g.l.Error(g, g.lang.tgchatbot.Config['hookChk.nofile'] + file)
    }

    // Проверка синтаксиса
    let wh = this.config_json.webhook
    if (wh == false) { // Без вебкрюка
      this.webhook = false
      return
    }
    if            (typeof wh        != 'object')  throwSyntaxErr()
    if            (typeof wh.domain != 'string')  throwSyntaxErr()
    if            (typeof wh.port   != 'string')  throwSyntaxErr()
    if            (typeof wh.path   != 'string')  throwSyntaxErr()
    if            (typeof wh.key    != 'string')  throwSyntaxErr()
    if            (typeof wh.cert   != 'string')  throwSyntaxErr()
    if (wh.ca &&  (typeof wh.ca     != 'string')) throwSyntaxErr()

    // Проверка значений
    if (!wh.domain.match(/^[a-z0-9.-]{5,}$/)) throwSyntaxErr()
    if (!wh.port.match(/^[0-9]{1,5}$/))       throwSyntaxErr()
    if ((wh.port < 1) || (65535 < wh.port))   throwSyntaxErr()
    if (!wh.path.match(/^[a-z0-9._/-]*$/))    throwSyntaxErr()

    // Проверка наличия файлов сертификатов
    if            (!g.fs.fileExists(g, wh.key))   throwFileErr(wh.key)
    if            (!g.fs.fileExists(g, wh.cert))  throwFileErr(wh.cert)
    if (wh.ca &&  (!g.fs.fileExists(g, wh.ca)))   throwFileErr(wh.ca)

    // Сохранение
    this.webhook = wh
  }

  // Проверяет максимальные размеры инлайн и нижней клавиатуры
  kbdSizeChk(g) {
    function throwErr() {
      throw new g.l.Error(g, g.lang.tgchatbot.Config['kbdSizeChk'])
    }

    // Функция проверки на натуральность
    function isNat(val) {
      val = Number(val)
      if (!val)                   return false
      if (val < 0)                return false
      if (val != Math.floor(val)) return false
      return true
    }

    // Проверка синтаксиса
    if (typeof this.config_json.kbdSize != 'object') throwErr()
    if (!isNat(this.config_json.kbdSize.w)) throwErr()
    if (!isNat(this.config_json.kbdSize.h)) throwErr()

    // Сохранение
    this.kbdSize = this.config_json.kbdSize
  }

  // Проверяет подгрузку запрошенных модулей сюжета (точка входа по умолчанию
  // плюс точки входа по привелегиям)
  storiesChk(g) {
    // Проверка наличия модулей и функций инициализации
    if (typeof this.config_json.defMod != 'string')
      throw new g.l.Error(g, g.lang.tgchatbot.Config['storiesChk.1'])
    if (!g.m[this.config_json.defMod])
      throw new g.l.Error(g, g.lang.tgchatbot.Config['storiesChk.2'] + this.config_json.defMod)
    if (!(g.m[this.config_json.defMod].init instanceof Function))
      throw new g.l.Error(g, g.lang.tgchatbot.Config['storiesChk.3'] + this.config_json.defMod)
    for (let i in this.config_json.priv) {
      if (!g.m[this.config_json.priv[i]])
        throw new g.l.Error(g, g.lang.tgchatbot.Config['storiesChk.4'] + this.config_json.priv[i])
      if (!(g.m[this.config_json.priv[i]].init instanceof Function))
        throw new g.l.Error(g, g.lang.tgchatbot.Config['storiesChk.5'] + this.config_json.priv[i])
    }

    // Сохранение параметров
    this.defMod = this.config_json.defMod
    this.priv = this.config_json.priv
  }

  // Проверяет переменную timeout
  timeoutChk(g) {
    if ((typeof this.config_json.timeout == 'number') && (this.config_json.timeout >= 0)) {
      this.timeout = this.config_json.timeout
      return
    }
    if ((typeof this.config_json.timeout == 'string') && this.config_json.timeout.match(/^[0-9]+$/)) {
      this.timeout = Number(this.config_json.timeout)
      return
    }
    throw new g.l.Error(g, g.lang.tgchatbot.Config['timeoutChk'])
  }

  // Проверяет переменную разметки по умолчанию
  // {"parse_mode": "Markdown", "disable_web_page_preview": true}
  markupChk(g) {
    if ((typeof this.config_json.defMarkup == 'object') && (typeof this.config_json.defMarkup.parse_mode == 'string')) {
      this.defMarkup = this.config_json.defMarkup
      return
    }
    throw new g.l.Error(g, g.lang.tgchatbot.Config['markupChk'])
  }

  // Проверяет переменные логирования
  logChk(g) {
    function throwErr(name) {
      throw new g.l.Error(g, g.lang.tgchatbot.Config['logChk.'+name])
    }

    if (typeof this.config_json.logs    != 'boolean') throwErr('logs')
    this.logs     = this.config_json.logs
    if (typeof this.config_json.conlogs != 'boolean') throwErr('conlogs')
    this.conlogs  = this.config_json.conlogs
  }
}

module.exports = Config
