const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const bcrypt = require('bcrypt')
// const saltRounds = 10
const connection = mysql.createConnection({
  host: 'mysql',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: 'janken_rating'
})
const recaptcha = require("recaptcha-promise")
recaptcha.init({
  secret_key: process.env.RECAPTCHA_SECRET_KEY
})
const Player = require('../utils/player')

router.post('/', async (req, res) => {
  const name = req.body.name
  const plainPass = req.body.password
  const player = new Player()
  const recaptchaRes = req.body.recaptcha
  const success = await recaptcha(recaptchaRes)
  if (!success) {
    res.status(400).json({ status: 'ng', err: 'rechaptchaErr'})
    return
  }
  console.log(success ? "Response valid" : "Response invalid")

  player.login(name, plainPass).then(token => {
    res.status(200).json({ status: 'ok', token })
  }).catch(err => {
    //console.log(err)
    if (err === 'unexpectedPas' || err === 'wrongPass') {
      res.status(401).json({ status: 'ng', err })
      return
    }
    res.status(500).json({ status: 'ng' })
    console.log(err)
  })

  // --------------------------
  // const token = Math.random().toString(32).substring(2)
  // connection.execute('SELECT `password`,`id` FROM `players` WHERE `name`=?', [name], (err, result) => {
  //   //console.log(name)
  //   //console.log(result)
  //   if (err) {
  //     res.status(500).json({ status: 'ng', err: 'resErr' })
  //     return
  //   }
  //   if (result.length === 0) {
  //     res.status(401).json({ status: 'ng', err: 'unexpectedPas' })
  //     return
  //   }
  //   bcrypt.compare(plainPass, result[0].password, (err, passRes) => {
  //     if (err) {
  //       res.status(500).json({ status: 'ng', err: 'bycryptErr' })
  //       return
  //     }
  //     if (passRes) {
  //       // res.json({ status: 'ok' })
  //       // INSERT INTO `session` (`id`, `token`) VALUES ('13', 'b');
  //       connection.execute('INSERT INTO `session` (`id`, `token`) VALUES (?, ?)', [result[0].id, token], (err, tokenRes) => {
  //         if (err) {
  //           // エラー表示
  //           //console.log(err)
  //           res.status(500).json({ status: 'ng', err: 'tokenErr' })
  //           return
  //         }
  //         res.json({ status: 'ok', token: token })
  //       })
  //       return
  //     }
  //     res.status(500).json({ status: 'ng', err: 'others' })
  //   })
  // })
})

module.exports = router
