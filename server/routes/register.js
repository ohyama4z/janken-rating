const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const saltRounds = 10
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pu-sannoho-muranda-bi-',
  database: 'janken_rating'
})

router.post('/', (req, res, next) => {
  const name = req.body.name
  const plainPassword = req.body.password
  console.log(name, plainPassword)
  // console.log(req)
  if (name.length > 10) {
    res.status(400).json({ status: 'ng', err: 'nameLenErr' })
    return
  }
  if (plainPassword.length < 8 && plainPassword.length > 64) {
    res.status(400).json({ status: 'ng', err: 'passLenErr' })
    return
  }

  // db
  connection.query('SELECT COUNT(*) AS num FROM `players` WHERE `name`=?',[name],(err,result) => {
    if (err) {
      res.status(500).json({ status: 'ng', err: 'internalServerErr' })
      return
    }
    if (result[0].num > 0) {
      res.status(400).json({ status: 'ng', err: 'nameConflictedErr' })
      return
    }
    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
      if (err) {
        console.log('ハッシュ化！！！')
        res.status(500).json({ status: 'ng', err: 'internalServerErr' })
        return
      }
      connection.query(`INSERT INTO players (name, password) VALUES (?, ?);`, [name, hash], (err, result) => {
        if (err) {
          console.log('データベース！！！')
          res.status(500).json({ status: 'ng', err: 'internalServerErr' })
          console.log(err)
          return
        }
        res.json({
          status: 'ok'
        })
      })
    })
  })
})
module.exports = router
