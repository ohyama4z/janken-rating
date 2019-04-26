const express = require('experess')
const router = express.Router()
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const saltRounds = 10
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pu-sannoho-muranda-bi-',
  database: 'chat'
})

router.post('/', (req, res, next) => {
  const name = req.query.name
  const plainPassword = req.query.password
  if (name.length > 10) {
    res.status(400).json({ status: 'ng', err: 'nameLenErr' })
  } else if (plainPassword.length < 8 && plainPassword.length > 64) {
    res.status(400).json({ status: 'ng', err: 'passLenErr' })
  }
  bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    if (err) {
      res.status(500).json({ status: 'ng', err: 'internalServerErr' })
      return
    }
    connection.query(`INSERT INTO players (name, password) VALUES (?, ?);`, [name, hash], (err, result) => {
      if (err) {
        res.status(500).json({ status: 'ng', err: 'internalServerErr' })
        return
      }
      res.json({
        status: 'ok'
      })
    })
  })
})
module.exports = router