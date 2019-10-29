const mysql2 = require('mysql2/promise')
const dest = require('./common').databaseDest
const bcrypt = require('bcrypt')
const saltRounds = 10
const notif = require('../socket/notif').notif

class Player {
  constructor () {
    this.id = null
  }

  authorize (token) {
    const self = this
    return mysql2.createConnection(dest).then(conn => {
      return conn.query('SELECT `id` FROM `session` WHERE `token`=?', [token])
    }).then(([res]) => {
      if (res.length === 0) {
        return Promise.reject(new Error('invalidToken'))
      }
      self.id = res[0].id
      console.log(res)
      // console.log(res[0].id)
    })
  }

  checkAuth () {
    if (this.id == null) {
      return Promise.reject(new Error('unauthorized'))
    }
    return Promise.resolve()
  }

  createRoom () {
    const self = this
    return this.checkAuth().then(res => {
      return mysql2.createConnection(dest)
    }).then(conn => {
      const roomId = Math.floor(Math.random() * 10000)
      return Promise.all([
        conn,
        roomId,
        conn.query('INSERT INTO `rooms` (`id`, `player_id`) VALUES (?,?)', [roomId, self.id])
      ])
    }).then(([conn, roomId]) => {
      return Promise.all([
        roomId,
        conn.query('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, 1, ?)', [roomId, self.id])
      ])
    }).then(([roomId]) => {
      return roomId
    })
  }

  register (name, plainPass) {
    return new Promise((resolve, reject) => {
      if (name.length > 10) {
        reject(new Error('nameLenErr'))
        return
      }
      if (plainPass.length < 8 && plainPass.length > 64) {
        reject(new Error('passLenErr'))
        return
      }
      resolve()
    }).then(() =>
      mysql2.createConnection(dest)
    ).then(conn => {
      return Promise.all([
        conn,
        conn.query('SELECT COUNT(*) AS num FROM `players` WHERE `name`=?', [name])
      ])
    }).then(([conn, res]) => {
      if (res[0].num > 0) {
        return Promise.reject(new Error('nameConflictedErr'))
      }
      return Promise.all([
        conn,
        bcrypt.hash(plainPass, saltRounds)
      ])
    }).then(([conn, hash]) => {
      return conn.query(`INSERT INTO players (name, password) VALUES (?, ?);`, [name, hash])
    }).then(() => {})
  }

  login (name, plainPass) {
    return mysql2.createConnection(dest).then(conn => {
      return Promise.all([
        conn,
        conn.query('SELECT `password`,`id` FROM `players` WHERE `name`=?', [name])
      ])
    }).then(([conn, [res]]) => {
      if (res.length === 0) {
        return Promise.reject(new Error('unexpectedPas'))
      }
      console.log(plainPass, res)
      return Promise.all([
        conn,
        res[0].id,
        bcrypt.compare(plainPass, res[0].password)
      ])
    }).then(([conn, id, res]) => {
      console.log(res)
      if (!res) {
        return Promise.reject(new Error('wrongPass'))
      }
      const token = Math.random().toString(32).substring(2)
      return Promise.all([
        token,
        conn.query('INSERT INTO `session` (`id`, `token`) VALUES (?, ?)', [id, token])
      ])
    }).then(([token]) => {
      return token
    })
  }

  joinRoom (roomId) {
    const self = this
    return this.checkAuth().then(() => {
      return mysql2.createConnection(dest)
    }).then(conn => {
      // console.log(self.id)
      console.log('122', roomId)
      return conn.query('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, 0, ?)', [roomId, self.id])
    }).then(() => {
      return this.getRoomStatus(roomId)
    }).then(res => {
      return notif.joined(roomId, res)
    }).then(() => {})
  }

  getRoomStatus (roomId) {
    return mysql2.createConnection(dest).then(conn => {
      return conn.query('SELECT * FROM `players`,`room_players` WHERE players.id=room_players.player_id AND room_players.room_id=?', [roomId])
    }).then(([rows]) => {
      const players = []
      rows.forEach((row) => {
        players.push({
          icon: row.icon,
          leader: row.leader === 1,
          id: row.player_id,
          name: row.name,
          rate: row.rating,
          comment: row.comment
        })
      })
      return players
    })
  }

  startGame (data) {
    const self = this
    const player = new Player
    return this.checkAuth().then(() => {
      return mysql2.createConnection(dest)
    }).then(conn => {
      conn.query('')
    })
  }
}

module.exports = Player
