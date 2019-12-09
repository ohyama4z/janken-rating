const mysql2 = require('mysql2/promise')
const dest = require('./common').databaseDest
const bcrypt = require('bcrypt')
const saltRounds = 10
const notif = require('../socket/notif').notif
const filetype = require('file-type')
const aws = require('aws-sdk')
const awsS3 = require('./common').awsS3
const s3 = new aws.S3(awsS3)

class Player {
  constructor () {
    this.id = null
  }

  authorize (token) {
    const self = this
    return mysql2.createConnection(dest).then(conn => {
      return conn.execute('SELECT `id` FROM `session` WHERE `token`=?', [token])
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
        conn.execute('SELECT COUNT(*) AS num FROM `players` WHERE `name`=?', [name])
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
      return conn.execute(`INSERT INTO players (name, password) VALUES (?, ?);`, [name, hash])
    }).then(() => {})
  }

  login (name, plainPass) {
    return mysql2.createConnection(dest).then(conn => {
      return Promise.all([
        conn,
        conn.execute('SELECT `password`,`id` FROM `players` WHERE `name`=?', [name])
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
        conn.execute('INSERT INTO `session` (`id`, `token`) VALUES (?, ?)', [id, token])
      ])
    }).then(([token]) => {
      return token
    })
  }

  getProfile (id) {
    return this.checkAuth().then(() => {
      return mysql2.createConnection(dest)
    }).then(conn => {
      return conn.execute('SELECT * FROM `players` WHERE `id`=?', [id])
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
          conn.execute('UPDATE `players` SET `comment`=? WHERE `id` = ?', [editData.comment, self.id])
        ])
      }
      return [conn]
    }).then(([conn]) => {
      if (editData.icon != null) {
        return new Promise((resolve, reject) => {
          console.log(editData.icon.substr(0, 10))
          const fileData = editData.icon.replace(/^data:\w+\/\w+;base64,/, '')
          const decodedFile = new Buffer(fileData, 'base64')
          const fileType = filetype(decodedFile)
          // console.log(fileType)
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
            conn.execute('UPDATE `players` SET `icon`=? WHERE `id` = ?', [fileName, self.id])
            resolve()
          }).catch((err) => {
            reject(err)
          })
        })
      }
    })
  }

  async sendHand (data) {
    await this.checkAuth()
    const jankenData = {
      playerId: this.id,
      hand: data.hand
    }
    await notif.startGame(data.roomId,jankenData)
    return jankenData
  }
}


module.exports = Player
