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
    if(this.id == null) {
      throw new Error('invalidroomID')
    }
  }

  async init (roomId) {
    const conn = await mysql2.createConnection(dest)
    const res = await conn.execute('SELECT * FROM `rooms` WHERE `id` = ?',[roomId])
    if ([res].length > 0) {
      
    }
  }

  create (player) {
    const self = this
    return player.checkAuth().then(res => {
      return mysql2.createConnection(dest)
    }).then(conn => {
      const roomId = Math.floor(Math.random() * 10000)
      return Promise.all([
        conn,
        roomId,
        conn.execute('INSERT INTO `rooms` (`id`, `player_id`) VALUES (?,?)', [roomId, self.id])
      ])
    }).then(([conn, roomId]) => {
      return Promise.all([
        roomId,
        conn.execute('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, 1, ?)', [roomId, self.id])
      ])
    }).then(([roomId]) => {
      return roomId
    })
  }

  join (player) {
    const self = this
    return player.checkAuth().then(() => {
      return mysql2.createConnection(dest)
    }).then(conn => {
      //console.log(self.id)
      //console.log('122', roomId)
      return conn.execute('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, 0, ?)', [roomId, self.id])
    }).then(() => {
      return this.getRoomStatus(this.id)
    }).then(res => {
      return notif.joined(roomId, res)
    }).then(() => {})
  }

  getStatus (key,value) {
    // this.checkAuth().then(() => {
    return mysql2.createConnection(dest).then(conn => {
      if (value === 'roomId') {
        return conn.execute('SELECT * FROM `players`,`room_players` WHERE players.id=room_players.player_id AND room_players.room_id=?', [key])
      } else if (value === 'pubURL') {
        return conn.execute('SELECT * FROM `players`,`matching_room` WHERE players.id=matching_room.player_id AND matching_room.room_id=?', [key])
      }
    }).then(([rows]) => {
      const players = []
      // let areYouLeader = false
      rows.forEach((row) => {
        players.push({
          icon: row.icon != null ? `http://localhost:9000/janken-rating/icons/${row.icon}` : null,
          leader: row.leader === 1,
          id: row.player_id,
          name: row.name,
          rate: row.rating,
          comment: row.comment
        })
        // console.log(this)
        // console.log(row.player_id)
        // if (this.id === row.player_id && row.leader === 1) {
        //   areYouLeader = true
        // }
        // console.log(players)
      })
      // console.log(players)
      return players// [players,areYouLeader]
    }).then(players => {
      // console.log(players)
      return players
    })
  }

}