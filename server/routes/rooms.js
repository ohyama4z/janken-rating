const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const mysql2 = require('mysql2/promise')

// const saltRounds = 10
const dest = {
  host: 'mysql',
  user: 'janken',
  password: 'rating',
  database: 'janken_rating'
}

const connection = mysql.createConnection(dest)
const notif = require('../socket/notif').notif

router.post('/', (req, res) => {
  const roomId = Math.floor(Math.random() * 10000)

  mysql2.createConnection(dest).then(conn => {
    return Promise.all([
      conn,
      conn.query('SELECT `id` FROM `session` WHERE `token`=?', [req.body.token])
    ])
  }).then(([conn, [result]]) => {

    if (result.length === 0) {
      return Promise.reject(new Error('invalidToken'))
    }

    console.log(result)

    return Promise.all([
      result,
      conn,
      conn.query('INSERT INTO `rooms` (`id`, `player_id`) VALUES (?,?)', [roomId, result[0].id])
    ])
  }).then(([result, conn]) => {
    return conn.query('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, 1, ?)', [roomId, result[0].id])
  }).then(() => {
    res.status(201).json({ id: roomId, status: 'ok' })
  }).catch(err => {
    console.log(err)

    if (err.message === 'invalidToken') {
      res.status(401).json({ status: 'ng', err: 'invalidTokenErr' })
      return
    }

    res.status(500).json({ status: 'ng', err: 'resultErr', _internalErr: err })
  })

  // ----------------------------------------

//   connection.query {
//     if (err) {
//       res.status(500).json({ status: 'ng', err: 'resultErr' })
//       return
//     }
//     if (result.length === 0) {
//       res.status(401).json({ status: 'ng', err: 'unexpectedId' })
//       return
//     }
//     connection.query('INSERT INTO `rooms` (`id`, `player_id`) VALUES (?,?)', [roomId, result[0].id], (err, response) => {
//       if (err) {
//         res.status(500).json({ status: 'ng', err: 'responceErr' })
//         return
//       }
//       connection.query('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, 1, ?)', [roomId, result[0].id], (err, aho) => {
//         if (err) {
//           res.status(500).json({ status: 'ng', err: 'ahoErr' })
//           return
//         }
//         res.status(200).json({ id: roomId, status: 'ok' })
//       })
//     })
//   })
})

router.get('/:roomId/waiting', (req, res) => {
  const token = req.headers.authorization
  const roomId = req.params.roomId
  // SELECT * FROM players, room_players WHERE players.id=room_players.player_id AND room_players.room_id=4902
  connection.query('SELECT `id` FROM `session` WHERE `token`=?', [token], (err, bobo) => {
    if (err) {
      res.status(500).json({ status: 'ng', err: 'boboErr' })
      return
    }
    if (bobo.length === 0) {
      // console.log(bobo)
      // console.log(req.headers)
      res.status(401).json({ status: 'ng', err: 'tokenErr' })
      return
    }
    connection.query('SELECT * FROM `players`,`room_players` WHERE players.id=room_players.player_id AND room_players.room_id=?', [roomId], (err, waitingres) => {
      if (err) {
        console.log(err)
        res.status(500).json({ status: 'ng', err: 'resErr' })
        return
      }
      if (waitingres.length === 0) {
        res.status(404).json({ status: 'ng', err: 'noroomErr' })
        return
      }
      const playersData = []
      waitingres.forEach((row) => {
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
})

router.post('/:roomId/join', (req, res) => {
  // const players = []
  // {
  //   token: '',
  //   leader: False,
  //   name: '',
  //   id: null,
  //   rating: null,AG
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
    connection.query('INSERT INTO `room_players` (`room_id`, `leader`, `player_id`) VALUES (?, 0, ?)', [req.body.roomId, result[0].id], (err, bobo) => {
      if (err) {
        res.status(500).json({ status: 'ng', err: 'databaseErr1' })
        return
      }
      connection.query('SELECT * FROM `players`,`room_players` WHERE players.id=room_players.player_id AND room_players.room_id=?', [req.body.roomId], (err, ahos) => {
        if (err) {
          res.status(500).json({ status: 'ng', err: 'databaseErr2' })
          return
        }
        const players = []
        ahos.forEach(aho => {
          players.push({
            leader: aho.leader === 1,
            name: aho.name,
            id: aho.id,
            rating: aho.rating,
            comment: aho.comment
          })
        })
        notif.joined(req.body.roomId, players)
        res.status(201).json({ status: 'ok' })
      })
    })
  })
})

module.exports = router
