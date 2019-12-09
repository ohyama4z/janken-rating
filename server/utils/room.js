const mysql2 = require('mysql2/promise')
const dest = require('./common').databaseDest
const notif = require('../socket/notif').notif
const filetype = require('file-type')
const aws = require('aws-sdk')
const awsS3 = require('./common').awsS3
const s3 = new aws.S3(awsS3)

class Room {
  constructor () {
    this.id = null
    this.url = null
  }

  exists () {
    if (this.id == null) {
      throw new Error('uninitialized')
    }
  }

  async initWithEnterCode (enterCode) {
    // get roomId from enter code
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT `id` FROM `rooms` WHERE `enter_code`=?',[enterCode])
    await this.init(res[0].id)
  }

  async init (roomId) {
    if (roomId == null) {
      throw new Error('roomIdIsRequired')
    }
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT * FROM `rooms` WHERE `id` = ?', [roomId])
    if (res.length === 1) {
      this.id = roomId
      return
    }
    throw new Error('invalidroomID')
  }

  async create () {
    const conn = await mysql2.createConnection(dest)
    const enterCode = Math.floor(Math.random() * 10000)
    const roomId = Math.random().toString(32).substring(2)
    await conn.execute('INSERT INTO `rooms` (`id`, `enter_code`, `state`) VALUES (?,?,`wating`)', [roomId, enterCode])
    this.id = roomId
  }
  async join (player, isLeader = false) {
    this.exists()
    await player.checkAuth()
    const conn = await mysql2.createConnection(dest)
    const leader = isLeader ? 1 : 0
    await conn.execute('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, ?, ?)', [this.id,leader, player.id])
    const players = await this.getPlayers()
    await notif.joined(this.id, players)
  }

  // getPlayers ... プレイヤー一覧の取得

  async getPlayers () {
    // this.checkAuth().then(() => {
    this.exists()
    const conn = await mysql2.createConnection(dest)
    const [rows] = await conn.execute('SELECT * FROM `players`,`room_players` WHERE players.id=room_players.player_id AND room_players.room_id=?', [this.id])
    const players = []
    rows.forEach((row) => {
      players.push({
        icon: row.icon != null ? `http://localhost:9000/janken-rating/icons/${row.icon}` : null,
        leader: row.leader === 1,
        id: row.player_id,
        name: row.name,
        rate: row.rating,
        comment: row.comment
      })
    })
    return players
  }
  // getInfo
  // enterCode, hogehoge === 'waiting', 'playing', 'finished'
  async getInfo (player) {
    this.exists()
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT `enter_code`,`start_time`,`state` FROM `rooms` WHERE `id`=?', [this.id])
    const [leaderId] = await conn.execute('SELECT `player_id` FROM `room_players` WHERE `leader`=1 AND `room_id`=?', [this.id])
    return {
      enterCode: res[0].enter_code,
      leader: leaderId[0].player_id === player.id,
      startTime: res[0].start_time,
      state: res[0].state
    }
  }

  async start (player) {
    this.exists()
    player.checkAuth()
    const conn = await mysql2.createConnection(dest)
    const [checkLen] = await conn.execute('SELECT * FROM `room_players` WHERE `room_id`=?', [this.id])
    if (checkLen.length < 2) {
      throw new Error('tooFewMember')
    }
    const [res] = await conn.execute('SELECT * FROM `room_players` WHERE `room_id`=? AND `player_id`=?', [this.id, player.id])
    if (res[0].leader !== 1) {
      throw new Error('youAreNotLeader')
    }
    const limit = Date.now() + 10
    await conn.execute('UPDATE `rooms` SET `enter_code`=null, `state`=`matching`, `start_time`=? WHERE `id`=?', [limit, this.id])
    await notif.started(this.id)
  }

  async hasJoined (player) {
    this.exists()
    await player.checkAuth()
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT `player_id` FROM `room_players` WHERE `room_id`=?', [this.id])
    if (res.length === 0) {
      throw new Error('notJoined')
    }
    return true
  }
}

module.exports = Room
