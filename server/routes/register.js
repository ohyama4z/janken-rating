const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const saltRounds = 10
const connection = mysql.createConnection({
  host: 'mysql',
  user: 'janken',
  password: 'rating',
  database: 'janken_rating'
})
const Player = require('../utils/player')

router.post('/', (req, res, next) => {
  const name = req.body.name
  const plainPass = req.body.password
  //console.log(name, plainPass)
  const player = new Player()
  player.register(name, plainPass).then(() => {
    res.status(201).json({ status: 'ok' })
  }).catch(err => {
    //console.log(err)
    if (
      err.status === 'nameLenErr' ||
      err.status === 'passLenErr' ||
      err.status === 'nameConflictedErr'
    ) {
      res.status(400).json({ status: 'ng', err })
      return
    }
    res.status(500).json({ status: 'ng' })
    console.log(err)
  })

  // --------------------------------
  // //console.log(req)
  // if (name.length > 10) {
  //   res.status(400).json({ status: 'ng', err: 'nameLenErr' })
  //   return
  // }
  // if (plainPass.length < 8 && plainPass.length > 64) {
  //   res.status(400).json({ status: 'ng', err: 'passLenErr' })
  //   return
  // }
  // db
  // connection.execute('SELECT COUNT(*) AS num FROM `players` WHERE `name`=?', [name], (err, result) => {
  //   if (err) {
  //     res.status(500).json({ status: 'ng', err: 'internalServerErr' })
  //     //console.log(err)
  //     return
  //   }
  //   if (result[0].num > 0) {
  //     res.status(400).json({ status: 'ng', err: 'nameConflictedErr' })
  //     return
  //   }
  //   bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  //     if (err) {
  //       //console.log('ハッシュ化！！！')
  //       res.status(500).json({ status: 'ng', err: 'internalServerErr' })
  //       return
  //     }
  //     connection.execute(`INSERT INTO players (name, password) VALUES (?, ?);`, [name, hash], (err, result) => {
  //       if (err) {
  //         //console.log('データベース！！！')
  //         res.status(500).json({ status: 'ng', err: 'internalServerErr' })
  //         //console.log(err)
  //         return
  //       }
  //       })
  //     })
  //   })
  // })

})

module.exports = router
