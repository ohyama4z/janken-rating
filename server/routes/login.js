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

router.post('/', (req, res) => {
  const name = req.body.name
  const plainPassword = req.body.password
  connection.query('SELECT `password` FROM `players` WHERE `name`=?', [name], (err, result) => {
    console.log(name)
    console.log(result)
    if (err) {
      res.status(500).json({ status: 'ng' })
      // console.log('あほ！')
      return
    }
    bcrypt.compare(plainPassword, result[0].password, (err, passRes) => {
      if (err) {
        res.status(500).json({ status: 'ng' })
        // console.log('ちょくだいのばか！')
        return
      }
      if (passRes) {
        res.json({ status: 'ok' })
        // console.log('りんご')
        return
      }
      res.status(500).json({ status: 'ng' })
      // console.log('すぬけ')
    })
  })
})

module.exports = router
