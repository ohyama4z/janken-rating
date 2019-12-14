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
    const [res] = await conn.execute('SELECT `id` FROM `rooms` WHERE `enter_code`=?', [enterCode])
    conn.end()
    await this.init(res[0].id)
  }

  async init (roomId) {
    if (roomId == null) {
      throw new Error('roomIdIsRequired')
    }
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT * FROM `rooms` WHERE `id` = ?', [roomId])
    conn.end()
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
    await conn.execute('INSERT INTO `rooms` (`id`, `enter_code`, `state`) VALUES (?,?,?)', [roomId, enterCode,'waiting'])
    conn.end()
    this.id = roomId
  }
  async join (player, isLeader = false) {
    this.exists()
    await player.checkAuth()
    const conn = await mysql2.createConnection(dest)
    const leader = isLeader ? 1 : 0
    await conn.execute('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, ?, ?)', [this.id,leader, player.id])
    conn.end()
    const players = await this.getPlayers()
    await notif.joined(this.id, players)
  }

  // getPlayers ... プレイヤー一覧の取得

  async getPlayers () {
    // this.checkAuth().then(() => {
    this.exists()
    const conn = await mysql2.createConnection(dest)
    const [rows] = await conn.execute('SELECT * FROM `players`,`room_players` WHERE players.id=room_players.player_id AND room_players.room_id=?', [this.id])
    conn.end()
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
    conn.end()
    return {
      enterCode: res[0].enter_code,
      leader: leaderId[0].player_id === player.id,
      startTime: res[0].start_time,
      state: res[0].state
    }
  }

  async start (player, players) {
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
    const limit = Date.now() + 10000

    await conn.execute('UPDATE `rooms` SET `enter_code`=null, `state`=?, `start_time`=? WHERE `id`=?', ['matcing', limit, this.id])
    conn.end()
    await notif.started(this.id)
    await setTimeout(() => this.janken(player, players), limit - Date.now())
  }

  async hasJoined (player) {
    this.exists()
    await player.checkAuth()
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT `player_id` FROM `room_players` WHERE `room_id`=?', [this.id])
    conn.end()
    if (res.length === 0) {
      throw new Error('notJoined')
    }
    return true
  }

  async sendHand (data, player) {
    this.exists()
    await player.checkAuth()
    const conn = await mysql2.createConnection(dest)

    await conn.execute('UPDATE `room_players` SET `hand`=? WHERE `player_id`=?', [data.hand, player.id])
    conn.end()
  }

  async janken (player, playerData) {
    this.exists()
    let players = []
    await player.checkAuth()
    const conn = await mysql2.createConnection(dest)
    const [rows] = await conn.execute('SELECT `player_id`, `hand` FROM `room_players` WHERE `room_id`=?', [this.id])
    conn.end()
    const hands = {
      goo: false,
      choki: false,
      par: false
    }
    rows.forEach(row => {
      players = this.insertHand(row, playerData)

      if (row.hand === 'goo') {
        hands.goo = true
        return
      }
      if (row.hand === 'choki') {
        hands.choki = true
        return
      }
      if (row.hand === 'par') {
        hands.par = true
        return
      }
      console.log(row)
      throw new Error('invaliedHand')
    })
    const jadgeRes = this.jadge(hands, rows)
    if (jadgeRes.aiko) {
      await this.aiko(player, players)
      return
    }
    await this.finish(jadgeRes, rows)
  }

  jadge (hands) {
    const jadgeRes = {
      aiko: false,
      winHand: null,
      loseHand: null
    }
    let kindHands = 0
    kindHands += hands.goo ? 1 : 0
    kindHands += hands.choki ? 1 : 0
    kindHands += hands.par ? 1 : 0

    if (kindHands !== 2) {
      jadgeRes.aiko = true
      return jadgeRes
    }
    if (!hands.goo) {
      jadgeRes.winHand = 'choki'
      jadgeRes.loseHand = 'par'
      return jadgeRes
    }
    if (!hands.choki) {
      jadgeRes.winHand = 'par'
      jadgeRes.loseHand = 'goo'
      return jadgeRes
    }
    // パーないとき
    jadgeRes.winHand = 'goo'
    jadgeRes.loseHand = 'choki'
    return jadgeRes
  }

  insertHand (jankenData, playerData) {
    playerData.forEach(player => {
      if (jankenData.player_id === player.id) {
        player.hand = jankenData.hand
      }
    })
    return playerData
  }

  async aiko (player, playersData) {
    const conn = await mysql2.createConnection(dest)
    await conn.execute('UPDATE `room_players` SET `hand`=null WHERE `room_id`=?', [this.id])
    const limit = Date.now() + 10000
    await conn.execute('UPDATE `rooms` SET `enter_code`=null, `start_time`=? WHERE `id`=?', [limit, this.id])
    conn.end()
    await notif.aiko(this.id, playersData)
    await this.start(player, playersData)
  }

  async finish (jadgeRes, playerRows) {
    const playerData = playerRows.map(async row => {
      const result = row.hand === jadgeRes.winHand
      const conn = await mysql2.createConnection(dest)
      await conn.execute('UPDATE `room_players` SET `result`=? WHERE `room_id`=? AND `player_id`=?', [result, this.id, row.player_id])
      conn.end()
      return {
        icon: row.icon != null ? `http://localhost:9000/janken-rating/icons/${row.icon}` : null,
        leader: row.leader === 1,
        id: row.player_id,
        name: row.name,
        rate: row.rating,
        comment: row.comment,
        hand: row.hand,
        result
      }
    })
    await notif.finish(this.id, playerData)
  }

  async getAveRate (rows) {
    let playerNum = 0
    let sumRate
    rows.forEach(row => {
      playerNum += 1
      sumRate += row.rate
    })
    return Math.floor(sumRate/playerNum)
  }

  async getResults (player) {
    this.exists()
    await player.checkAuth()
    const conn = await mysql2.createConnection(dest)
    const [players] = await conn.execute('SELECT * FROM `players`,`room_players` WHERE players.id=room_players.player_id AND room_players.room_id=?', [this.id])
    const aveRate = this.getAveRate(conn)
    let eachRate
    const results = players.map(eachPlayer => {
      if (eachPlayer.result) {
        eachRate = Math.floor(eachPlayer.rate + (16 + (aveRate - eachPlayer.rate) * 0.04))
      } else {
        eachRate = Math.floor(eachPlayer.rate - (16 + (eachPlayer.rate - aveRate) * 0.04))
      }
      conn.execute('UPDATE `players` SET `rate`=? WHERE `id`=?', [eachRate, eachPlayer.id])

      return {
        icon: eachPlayer.icon != null ? `http://localhost:9000/janken-rating/icons/${row.icon}` : null,
        leader: eachPlayer.leader === 1,
        id: eachPlayer.player_id,
        name: eachPlayer.name,
        rate: eachRate,
        comment: eachPlayer.comment,
        hand: eachPlayer.hand,
        result: eachPlayer.result
      }
    })
    console.log(res)
    return res
  }
}

module.exports = Room
