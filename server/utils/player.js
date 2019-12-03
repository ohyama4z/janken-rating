const mysql2 = require('mysql2/promise')
const dest = require('./common').databaseDest
const bcrypt = require('bcrypt')
const saltRounds = 10
const notif = require('../socket/notif').notif
const filetype = require('file-type')
const aws = require('aws-sdk')
const s3 = new aws.S3({
  accessKeyId: 'janken-rating' ,
  secretAccessKey: 'password' ,
  endpoint: 'http://minio:9000' ,
  s3ForcePathStyle: true, // needed with minio?
  signatureVersion: 'v4'
})

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
      //console.log(res)
      // //console.log(res[0].id)
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
      //console.log(plainPass, res)
      return Promise.all([
        conn,
        res[0].id,
        bcrypt.compare(plainPass, res[0].password)
      ])
    }).then(([conn, id, res]) => {
      //console.log(res)
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

  getProfile (id) {
    return this.checkAuth().then(() => {
      return mysql2.createConnection(dest)
    }).then(conn => {
      return conn.query('SELECT * FROM `players` WHERE `id`=?',[id])
    }).then(([res]) => {
      //console.log(res)
      const playerData = {
        id: res[0].id,
        name: res[0].name,
        rate: res[0].rating,
        comment: res[0].comment,
        icon: res[0].icon != null ? `http://localhost:9000/janken-rating/icons/${res[0].icon}` : null
      }
      return playerData
    })
  }

  editProfile (editData) {
    const self = this
    return this.checkAuth().then(() => {
      // console.log(JSON.stringify(editData))
      if (editData == null || (editData.comment == null && editData.icon == null)) {
        return Promise.reject(new Error('notexitEditData'))
      }
      return mysql2.createConnection(dest)
    }).then(conn => {
      if (editData.comment != null) {
        return Promise.all([
          conn,
          conn.query('UPDATE `players` SET `comment`=? WHERE `id` = ?', [editData.comment, self.id])
        ])
      }
      return [conn]
    }).then(([conn]) => {
      if (editData.icon != null) {
        return new Promise((resolve, reject) => {
          console.log(editData.icon.substr(0,10))
          const fileData = editData.icon.replace(/^data:\w+\/\w+;base64,/, '')
          const decodedFile = new Buffer(fileData, 'base64')
          const fileType = filetype(decodedFile)
          console.log(fileType)
          const fileExtension = fileType.ext //あとでなんとかする
          const contentType = fileType.mime //ここもなんとかする
          const fileName = `${Math.random().toString(32).substring(2)}.${fileExtension}`
          const params = {
            Body: decodedFile,
            Bucket: 'janken-rating',
            // Key: [Math.random().toString(32).substring(2), fileExtension].join('.'),
            Key: `icons/${fileName}`,
            ContentType: contentType,
            ACL: 'public-read'
          }
          //console.log(params)
          s3.putObject(params).promise().then(() => {
            //console.log('Success!!!')
            conn.query('UPDATE `players` SET `icon`=? WHERE `id` = ?', [fileName, self.id])
            resolve()
          }).catch((err) => {
            reject(err)
          })
        })
      }
    })
  }

  joinRoom (roomId) {
    const self = this
    return this.checkAuth().then(() => {
      return mysql2.createConnection(dest)
    }).then(conn => {
      // //console.log(self.id)
      //console.log('122', roomId)
      return conn.query('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, 0, ?)', [roomId, self.id])
    }).then(() => {
      return this.getRoomStatus(roomId)
    }).then(res => {
      return notif.joined(roomId, res)
    }).then(() => {})
  }

  getRoomStatus (roomId) {
    // this.checkAuth().then(() => {
    return mysql2.createConnection(dest).then(conn => {
      return conn.query('SELECT * FROM `players`,`room_players` WHERE players.id=room_players.player_id AND room_players.room_id=?', [roomId])
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

  // const pubURL = Math.random().toString(32).substring(2)

  async startGame(data) {
    await this.checkAuth()

    if (data.players.length < 2) {
      throw new Error('playersNumErr')
    }

    
    const conn = await mysql2.createConnection(dest)
    await conn.query('DELETE * FROM `room_players` WHERE `room_id` = ?',[data.roomId])
    await conn.query('DELETE * FROM `rooms` WHERE `id` = ?',[data.roomId])

    const pubURL = Math.random().toString(32).substring(2)
    await conn.query('INSERT INTO `matching_room` (`room_id`, `player_Id`) VALUES (?, ?)',[pubURL,data.player_id])
    
    return pubURL
  }
}

module.exports = Player
