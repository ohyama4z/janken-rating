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
    const [rows] = await conn.execute(`
      SELECT 
        players.id AS id,
        players.icon AS icon,
        players.name AS name,
        players.comment AS comment,
        room_players.leader AS leader#,
        # rate.rate AS rate
      FROM players,room_players
      WHERE players.id=room_players.player_id AND room_players.room_id=?
    `, [this.id])
    console.log(rows)
    const players = await Promise.all(rows.map(async (row) => {
      const [rates] = await conn.execute(`SELECT rate FROM rate WHERE player_id=? ORDER BY finish_time DESC LIMIT 1`, [row.id])
      return{
        icon: row.icon != null ? `http://minio.jenkenrating.tk/janken-rating/icons/${row.icon}` : null,
        leader: row.leader === 1,
        id: row.id,
        name: row.name,
        rate: rates[0].rate,
        comment: row.comment
      }
    }))
    conn.end()
    return players
  }
  // getInfo
  // enterCode, hogehoge === 'waiting', 'playing', 'finished'
  async getInfo (player) {
    this.exists()
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT `enter_code`, `start_time`,`state`,`aiko` FROM `rooms` WHERE `id`=?', [this.id])
    const [leaderId] = await conn.execute('SELECT `player_id` FROM `room_players` WHERE `leader`=1 AND `room_id`=?', [this.id])
    conn.end()
    console.log(res[0].enter_code)
    return {
      enterCode: res[0].enter_code,
      leader: leaderId[0].player_id === player.id,
      startedAt: res[0].start_time - 10000,
      finishAt: res[0].start_time,
      state: res[0].state,
      aiko: res[0].aiko === 1 ? true : false
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

    await conn.execute('UPDATE `rooms` SET `enter_code`=null, `state`=?,`start_time`=? WHERE `id`=?', ['matching', limit, this.id])
    conn.end()
    notif.started(this.id)

    const sendData = await this.getInfo(player)
    notif.updateInfo(this.id, players, sendData)
    
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

    await conn.execute('UPDATE `room_players` SET `hand`=? WHERE `player_id`=? AND `room_id`=?', [data.hand, player.id, this.id])
    conn.end()
  }

  async janken (player, playerData) {
    console.log('aiko')
    try {
      throw new Error('getstacktraceOfJanken')
    } catch (e) {
      console.log(e)
    }
    this.exists()
    let players = []
    await player.checkAuth()
    const conn = await mysql2.createConnection(dest)
    const [rows] = await conn.execute('SELECT player_id, hand FROM room_players WHERE room_id=?', [this.id])
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
    console.log('aiko')
    try {
      throw new Error('getstacktraceOfAiko')
    } catch (e) {
      console.log(e)
    }
    const conn = await mysql2.createConnection(dest)
    await conn.execute('UPDATE `room_players` SET `hand`=null WHERE `room_id`=?', [this.id])
    const limit = Date.now() + 10000
    await conn.execute('UPDATE `rooms` SET `aiko`=1, `start_time`=? WHERE `id`=?', [limit, this.id])
    await this.start(player, playersData)
    conn.end()
  }

  async finish (jadgeRes, playerRows) {
    const conn = await mysql2.createConnection(dest)

    const playerRowsWithRate = await Promise.all(playerRows.map(async (row) => {
      const [oldRateRow] = await conn.execute('SELECT rate FROM rate WHERE player_id=? ORDER BY finish_time DESC LIMIT 1', [row.player_id])
      return {
        ...row,
        rate: oldRateRow[0].rate
      }
    }))
    const aveRate = this.getAveRate(playerRowsWithRate)

    await Promise.all(playerRowsWithRate.map(async row => {

      const result = row.hand === jadgeRes.winHand
      console.log('じふぇおｗ',result , this.id, row.player_id, row)
      await conn.execute('UPDATE `room_players` SET `result`=? WHERE `room_id`=? AND `player_id`=?', [result, this.id, row.player_id])
      const oldRate = row.rate
      console.log('り', result)
      const newRate = result ? Math.floor(oldRate + (16 + (aveRate - oldRate) * 0.04)) : Math.floor(oldRate - (16 + (oldRate - aveRate) * 0.04))
      console.log('にゅーれーと', newRate)
      const finishTime = Date.now()
      console.log('れーと', oldRate, aveRate)
      console.log('ｊふぃぺじゃ', row.player_id, this.id, finishTime)
      await conn.execute('INSERT INTO `rate`(player_id, room_id, rate, finish_time) VALUE (?, ?, ?, ?)', [row.player_id, this.id, newRate, finishTime])
    }))
    conn.end()
    await notif.finish(this.id)
  }

  getAveRate (rows) {
    let playerNum = 0
    let sumRate = 0
    rows.forEach(row => {
      console.log(row)
      playerNum += 1
      sumRate += row.rate
    })
    return Math.floor(sumRate/playerNum)
  }

  async getResults (player) {
    this.exists()
    await player.checkAuth()
    const conn = await mysql2.createConnection(dest)
    const [rows] = await conn.execute(`
      SELECT 
        players.id AS id,
        players.icon AS icon,
        players.name AS name,
        players.comment AS comment,
        room_players.leader AS leader,
        room_players.hand AS hand,
        room_players.result AS result
      FROM players,room_players
      WHERE players.id=room_players.player_id AND room_players.room_id=?
    `, [this.id])
    // const [rates] = await conn.execute(`SELECT rate FROM rate WHERE player_id=? ORDER BY finish_time DESC LIMIT 2`, [player.id])
    const myData = {
      playerId: player.id,
      hand: null,
      result: null
    }
    const players = await Promise.all(rows.map(async row => {
      console
      const [rates] = await conn.execute(`SELECT rate FROM rate WHERE player_id=? ORDER BY finish_time DESC LIMIT 2`, [row.id])
      if (row.id === myData.playerId) {
        myData.result = row.result ? 'Win' : 'Lose'
        myData.hand = row.hand
      }
      return {
        icon: row.icon != null ? `http://minio.jenkenrating.tk/janken-rating/icons/${row.icon}` : null,
        leader: row.leader === 1,
        id: row.id,
        name: row.name,
        rate: rates[0].rate,
        comment: row.comment,
        hand: row.hand,
        result: row.result,
        oldRate: rates[1].rate
      }
    }))
    conn.end()
    return {
      players,
      myData
    }
  }
}

module.exports = Room
