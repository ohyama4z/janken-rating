const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const mysql2 = require('mysql2/promise')
const Player = require('../utils/player')
const Room = require('../utils/room')

// const saltRounds = 10
const dest = {
  host: 'mysql',
  user: 'janken',
  password: 'rating',
  database: 'janken_rating'
}

router.post('/', async (req, res) => {
  try {
    const player = new Player()
    await player.authorize(req.body.token)
    const room = new Room()
    await room.create()
    await room.join(player,true)
    res.status(201).json({ id: room.id, status: 'ok' })
  } catch (err) {
    if (err.message === 'invalidToken') {
      res.status(401).json({ status: 'ng', err: 'invalidTokenErr' })
      return
    }
    res.status(500).json({ status: 'ng', err: 'resultErr', _internalErr: err })
    console.log(err)
  }
})

router.get('/:roomId/waiting', async (req, res) => {
  try {
    const player = new Player()
    await player.authorize(req.headers.authorization)
    const room = new Room()
    // console.log(req.headers)
    await room.init(req.params.roomId)
    const players = await room.getPlayers()
    const info = await room.getInfo()
    console.log(players)
    res.status(200).json({
        status: 'ok',
        players,
        enterCode: info.enterCode
    })
  } catch (err) {
    if (err.message === 'invalidToken') {
      res.status(401).json({ status: 'ng', err: 'invalidTokenErr' })
      return
    }
    res.status(500).json({ status: 'ng', err })
    console.log(err)
  }
})

router.post('/:enterCode/join', async (req, res) => {
  try {
    const enterCode = req.params.enterCode
    const player = new Player()
    await player.authorize(req.body.token)
    const room = new Room()
    await room.initWithEnterCode(enterCode)

    await room.join(player)
    return res.status(201).json({ status: 'ok', roomId: room.id  })
  } catch (err) {
    res.status(500).json({ status: 'ng' })
    console.log(err)
  }})

router.get('/:roomId/matching', async (req, res) => {
  try {
    const roomId = req.params.roomId
    const player = new Player()
    player.authorize(req.headers.authorization)
    const room = new Room()
    const players = await room.getPlayers()
    res.status(200).json({
      status: 'ok',
      players
    })
  } catch (err) {
    res.status(500).json({ status: 'ng', err })
    console.log(err)
  }
})

module.exports = router
