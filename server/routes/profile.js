const express = require('express')
const router = express.Router()
const Player = require('../utils/player')

router.get('/', (req, res) => {
  const token = req.token
  const player = new Player
  player.getProfile(token)
})

// コメント
// localhost:8080/api/profile/comment?token=トークン&content=こめんと
router.put('/comment', (req, res) => {
  connection.query()
  // console.log(req.files)
})

// アイコン
// localhost:8080/api/profile/icon
router.put('/icon', (req, res) => {
  console.log(req.files)
})

module.exports = router
