const express = require('express')
const router = express.Router()
const mysql = require('mysql')
// const saltRounds = 10
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pu-sannoho-muranda-bi-',
  database: 'janken_rating'
})
const notif = require('./socket/notif').notif

router.post('/', (req, res) => {
  const roomId = Math.floor(Math.random() * 10000)
  connection.query('SELECT `id` FROM `session` WHERE `token`=?', [req.body.token], (err, result) => {
    if (err) {
      res.status(500).json({ status: 'ng', err: 'resErr' })
      return
    }
    if (result.length === 0) {
      res.status(401).json({ status: 'ng', err: 'unexpectedId' })
      return
    }
    connection.query('INSERT INTO `rooms` (`id`, `player_id`) VALUES (?,?)', [roomId, result[0].id], (err, response) => {
      if (err) {
        res.status(500).json({ status: 'ng', err: 'resErr' })
        return
      }
      res.status(200).json({ id: roomId, status: 'ok' })
      connection.query('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, `1`, ?)', [roomId, result[0].id], (err, aho) => {
        if (err) {
          res.status(500).json({ status: 'ng', err: 'resErr' })
          return
        }
        res.status(200).json({ status: 'ok' })
      })
    })
  })
})

router.get('/:roomId/wating', (req, res) => {
  // SELECT * FROM players, room_players WHERE players.id=room_players.player_id AND room_players.room_id=4902
  connection.query('SELECT * FROM `players`,`room_players` WHERE `players.id`=`room_players.player_id` AND `room_players.room_id`=?', [req.body.roomId], (err, waitingres) => {
    if (err) {
      res.status(500).json({ status: 'ng', err: 'resErr' })
      return
    }
    const playersData = []
    waitingres.foreach((row) => {
      playersData.push({
        player_id: row.player_id,
        player_name: row.name,
        player_rate: row.rating,
        player_comment: row.comment
      })
    })
    res.status(200).json({ players: playersData })
  })
})

router.post('/:roomId/join', (req, res) => {
  // const players = []
  // {
  //   token: '',
  //   leader: False,
  //   name: '',
  //   id: null,
  //   rating: null,
  //   comment: ''
  // }
  connection.query('SELECT `id` FROM `session` WHERE `token`=?', [req.body.token], (err, result) => {
    if (err) {
      res.status(500).json({ status: 'ng', err: 'resErr' })
      return
    }
    if (result.length === 0) {
      res.status(400).json({ status: 'ng', err: 'tokenErr' })
      return
    }
    connection.query('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, 0, ?)', [req.body.roomId, result[0].id], (err, res) => {
      if (err) {
        res.status(500).json({ status: 'ng', err: 'databaseErr' })
        return
      }
      connection.query('SELECT * FROM `players`,`room_players` WHERE `players.id`=`room_players.player_id` AND `room_players.room_id`=?', [req.body.roomId], (err, ahos) => {
        if (err) {
          res.status(500).json({ status: 'ng', err: 'databaseErr' })
          return
        }
        const players = []
        ahos.foreach( aho => {
          players.push({
            leader: (aho.leader === 0) ? false: true,
            name: aho.name,
            id: aho.id,
            rating: aho.rating,
            comment: aho.comment
          })
        })
      })
      notif.joined(req.body.roomId, players)
      res.status(201).json({ status: 'ok' })
    })
  })
})

module.exports = router
