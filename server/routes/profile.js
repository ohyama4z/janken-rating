const express = require('express')
const router = express.Router()
const Player = require('../utils/player')

router.get('/', (req, res) => {
  const token = req.headers.authorize
  const player = new Player
  player.getProfile(token).then(profile => {
    return res.status(200).json({status: 'ok', profile})
  }).catch(err => {
    if (err === 'notExistEditData') {
      return res.status(400).json({status: 'ng', err})
    }
    res.status(500).json({status: 'ng'})
  })
})

router.post('/', (req, res) => {
  const token = req.heders.authorize
  const player = new Player
  player.authorize().then(() => {
    return player.editProfile(token, req.body.edit)
  })
})

module.exports = router
