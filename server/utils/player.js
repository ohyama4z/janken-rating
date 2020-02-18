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

  async authorize (token) {
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT `id` FROM `session` WHERE `token`=?', [token])
    conn.end()
    if (res.length === 0) {
      throw new Error('invalidToken')
    }
    this.id = res[0].id
  }

  checkAuth () {
    if (this.id == null) {
      throw new Error('unauthorized')
    }
    return true
  }

  async register (name, plainPass) {
    if (name.length > 10) {
      throw new Error('nameLenErr')
    }
    if (plainPass.length < 8 && plainPass.length > 64) {
      throw new Error('passLenErr')
    }
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT COUNT(*) AS num FROM `players` WHERE `name`=?', [name])
    if (res[0].num > 0) {
      throw new Error('nameConflictedErr')
    }
    const hash = await bcrypt.hash(plainPass, saltRounds)
    const [resultSetHeader] = await conn.execute(`INSERT INTO players (name, password) VALUES (?, ?);`, [name, hash])
    await conn.execute(`INSERT INTO rate (player_id, rate, finish_time) VALUES (?, 1500, ?)`, [resultSetHeader.insertId, Date.now()])
    conn.end()
  }

  async login (name, plainPass) {
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT `password`,`id` FROM `players` WHERE `name`=?', [name])
    if (res.length === 0) {
      throw new Error('unexpectedPas')
    }
    const id = res[0].id
    const hash = await bcrypt.compare(plainPass, res[0].password)
    if (!hash) {
      throw new Error('wrongPass')
    }
    const token = Math.random().toString(32).substring(2)
    await conn.execute('INSERT INTO `session` (`id`, `token`) VALUES (?, ?)', [id, token])
    conn.end()
    return token
  }

  async getProfile (id) {
    const conn = await mysql2.createConnection(dest)
    const [res] = await conn.execute('SELECT * FROM `players` WHERE `id`=?', [id])
    const [rate] = await conn.execute('SELECT rate FROM rate WHERE player_id=? ORDER BY finish_time DESC LIMIT 1', [id])
    conn.end()
    const playerData = {
      id: res[0].id,
      name: res[0].name,
      rate: rate[0].rate,
      comment: res[0].comment,
      icon: res[0].icon != null ? `https://minio.jankenrating.tk/janken-rating/icons/${res[0].icon}` : null
    }
    return playerData
  }

  async editProfile (editData) {
    await this.checkAuth()
    if (editData == null || (editData.comment == null && editData.icon == null)) {
      throw new Error('notexitEditData')
    }
    const conn = await mysql2.createConnection(dest)
    if (editData.comment != null) {
      await conn.execute('UPDATE `players` SET `comment`=? WHERE `id` = ?', [editData.comment, this.id])
    }
    if (editData.icon != null) {
      console.log(editData.icon.substr(0, 10))
      const fileData = editData.icon.replace(/^data:\w+\/\w+;base64,/, '')
      const decodedFile = Buffer.from(fileData, 'base64')
      const fileType = filetype(decodedFile)
      const fileExtension = fileType.ext
      const contentType = fileType.mime
      const fileName = `${Math.random().toString(32).substring(2)}.${fileExtension}`
      const params = {
        Body: decodedFile,
        Bucket: 'janken-rating',
        // Key: [Math.random().toString(32).substring(2), fileExtension].join('.'),
        Key: `icons/${fileName}`,
        ContentType: contentType,
        ACL: 'public-read'
      }
      await s3.putObject(params).promise()
      await conn.execute('UPDATE `players` SET `icon`=? WHERE `id` = ?', [fileName, this.id])
    }
  }
}

module.exports = Player
