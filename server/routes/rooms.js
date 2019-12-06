const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const mysql2 = require('mysql2/promise')
const Player = require('../utils/player')

// const saltRounds = 10
const dest = {
  host: 'mysql',
  user: 'janken',
  password: 'rating',
  database: 'janken_rating'
}

router.post('/', (req, res) => {
  const player = new Player()
  player.authorize(req.body.token).then(() => {
    return player.createRoom()
  }).then((roomId) => {
    res.status(201).json({ id: roomId, status: 'ok' })
  }).catch(err => {
    //console.log(err)
    if (err.message === 'invalidToken') {
      res.status(401).json({ status: 'ng', err: 'invalidTokenErr' })
      return
    }
    res.status(500).json({ status: 'ng', err: 'resultErr', _internalErr: err })
  })
})

router.get('/:roomId/waiting', (req, res) => {
  const roomId = req.params.roomId
  const player = new Player()
  player.authorize(req.headers.authorization).then(() => {
    return player.getRoomStatus(roomId)
  }).then((players) => {
    res.status(200).json({
      status: 'ok',
      players
    })
  }).catch(err => {
    res.status(500).json({ status: 'ng', err })
  })
})

router.post('/:roomId/join', (req, res) => {
  const roomId = req.params.roomId
  const player = new Player()
  player.authorize(req.body.token).then(() => {
    return player.joinRoom(roomId)
  }).then(() => {
    return res.status(201).json({ status: 'ok' })
  }).catch(err => {
    // console.log(err)
    res.status(500).json({ status: 'ng' })
  })
})

module.exports = router
