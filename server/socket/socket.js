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
      }
    })

    socket.on('startGame', async (unparsedData) => {
      try {
        const player = new Player()
        const data = JSON.parse(unparsedData)
        await player.authorize(data.token)
        const room = new Room()
        await room.init(data.roomId)
        await room.start(player)
      } catch (err) {
        console.log(err)
      }
    })

    socket.on('sendHand', async (unparsedData) => {
      const player = new Player()
      const data = JSON.parse(unparsedData)
      await player.authorize(data.token)
      const room = new Room()
      await room.init(data.roomId)
      await room.sendHand(data, player)
    })

    socket.on('janken', async (unparsedData) => {
      const player = new Player()
      const data = JSON.parse(unparsedData)
      await player.authorize(data.token)
      const room = new Room()
      await room.init(data.roomId)
      await room.janken()
    })
  })
}
