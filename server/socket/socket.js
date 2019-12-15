const Player = require('../utils/player')
const Room = require('../utils/room')
const notif = require('./notif').notif

module.exports = (io) => {
  io.sockets.on('connection', (socket) => {
    socket.on('watchRoom', async (json) => {
      const data = JSON.parse(json)
      const player = new Player()
      await player.authorize(data.token)
      const room = new Room()
      await room.init(data.roomId)
      const res = await room.hasJoined(player)
      if (res) {
        socket.join(room.id)
      }
    })
    socket.on('getUpdateInfo', async (unparsed) => {
      const data = JSON.parse(unparsed)
      console.log('aaあ', data.roomId)
      const player = new Player()
      await player.authorize(data.token)
      const room = new Room()
      await room.init(data.roomId)
      console.log(data, player, room)
      const players = await room.getPlayers()
      const sendData = await room.getInfo(player)
      notif.updateInfo(socket.id, players, sendData)
    })

    socket.on('startGame', async (unparsedData) => {
      try {
        const player = new Player()
        const data = JSON.parse(unparsedData)
        await player.authorize(data.token)
        const room = new Room()
        await room.init(data.roomId)
        await room.start(player, data.players)
      } catch (err) {
        console.log(err)
      }
    })

    socket.on('sendHand', async (unparsedData) => {
      console.log(unparsedData)
      const player = new Player()
      const data = JSON.parse(unparsedData)
      await player.authorize(data.token)
      const room = new Room()
      await room.init(data.roomId)
      console.log(player, room)
      await room.sendHand(data, player)
    })

    socket.on('janken', async (unparsedData) => {
      const player = new Player()
      const data = JSON.parse(unparsedData)
      await player.authorize(data.token)
      const room = new Room()
      await room.init(data.roomId)
      await room.janken(player, data.players)
    })
  })
}
