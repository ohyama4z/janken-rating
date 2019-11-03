const express = require('express')
const router = express.Router()
const Player = require('../utils/player')

router.get('/', (req, res) => {
  const token = req.headers.authorization
  const player = new Player
  player.authorize(token).then(() =>
    player.getProfile(player.id)
  ).then(profile => {
    return res.status(200).json({status: 'ok', profile})
  }).catch(err => {
    if (err === 'notExistEditData') {
      return res.status(400).json({status: 'ng', err})
    }
    res.status(500).json({status: 'ng'})
  })
})

router.post('/', (req, res) => {
  const token = req.headers.authorization
  const player = new Player
  player.authorize(token).then(() => {
    return player.editProfile(req.body.editData)
  }).then(profile => {
    return res.status(200).json({status: 'ok', profile})
  }).catch(err => {
    console.log(err)
    res.status(500).json({status: 'ng', err})
  })
})

module.exports = router
