//**********
/// Коллекция функций для работы с базой данных MongoDB
///
/// @project tgchatbot
/// @author James
/// @licence GPL-2.0-only
//**********

var db = {}
db.MC = require('mongodb').MongoClient /// Родной драйвер MongoDB

/// Проверяет строку подключения к БД в конфиге
db.dbChk = function (g) {
  if (!g.config.config_json.db.match(/^mongodb:\/\/[a-z0-9@:._/]{5,}$/i))
    throw new g.l.Error(g, g.lang.tgchatbot.db['dbChk'])
  g.config.db = g.config.config_json.db
}

/// Подключение к БД
db.init = function (g) {
  try {
    db.sock = new db.MC(g.config.db)
    db.sock.connect((err) => {
      if (err) throw new g.l.Error(g, g.lang.tgchatbot.db['init.err'])
      g.log.info(g.lang.tgchatbot.db['init.ok']) // Успешное подключение к БД
      db.db = db.sock.db(g.config.db.split('/')[3])
      g.db = {}
      g.db.users = db.db.collection('_users')
      g.db.stats = db.db.collection('_stats')
    })
  } catch (e) {
    throw new g.l.Error(g, g.lang.tgchatbot.db['init.err'] + e)
  }
  
  return "trying"
}

/// Отключение от БД
db.close = function (g) {
    db.sock.close()
    g.db = false
    g.log.info(g.lang.tgchatbot.db['close']) // Успешное отключение от БД
  }
}

module.exports = db
