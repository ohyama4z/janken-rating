let io
module.exports.listen = socketIo => {
  io = socketIo
}

module.exports.notif = {
  joined (roomId, playerData) {
    io.to(roomId).emit('playerData', JSON.stringify(playerData))
  },
  started (roomId) {
    io.to(roomId).emit('startGame')
  },
  aiko (roomId, players) {
    const sendData = { players }
    io.to(roomId).emit(`aiko`, JSON.stringify(sendData))
  },
  finished (roomId, playerData) {
    const sendData = { playerData }
    io.to(roomId).emit('finished', JSON.stringify(sendData))
  }
}
