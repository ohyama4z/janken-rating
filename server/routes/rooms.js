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

router.post('/', (req, res) => {
  const roomId = Math.floor(Math.random()*10000)
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
      res.status(201).json({ id: roomId, status: 'ok' })
    })
  })
})

router.get('/:roomId/wating', (req,res) => {
  // SELECT * FROM players, room_players WHERE players.id=room_players.player_id AND room_players.room_id=4902
  connection.query('SELECT * FROM `players`,`room_players` WHERE `players.id`=`room_players.player_id` AND `room_players.room_id`=?', [req.body.roomId], (err, waitingres) =>{
    if (err) {
      res.status(500).json({ status: 'ng', err: 'resErr' })
      return
    }
    const playersData = []
    waitingres.foreach((row)=>{
      playersData.push({
        player_id: row.player_id,
        player_name: row.name,
        player_rate: row.rating,
        player_comment: row.comment
      })
    })
    res.status(200).json({players: playersData})
  })
})

module.exports = router
