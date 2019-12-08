const Player = require('../utils/player')
const Room = require('../utils/room')

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
        console.log('watch?')
      }
    })

    socket.on('startGame', (unparsedData) => {
      const player = new Player
      const data = JSON.parse(unparsedData)
      // console.log(data)
      player.authorize(data.token).then(() => {
        return player.startGame(data)
      }).catch(err => {
        console.log(err)
      })
    })

    socket.on('sendHand', (unparsedData) => {
      const player = new Player
      const data = JSON.parse(unparsedData)
      player.authorize(data.token).then(() => {
        return player.sendHand(data)
      }).catch(err => {
        console.log(err)
      })
    })
  })
}
