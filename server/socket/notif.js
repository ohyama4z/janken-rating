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
  aiko (roomId) {
    io.to(roomId).emit(`aiko`)
  },
  jankenWinner (roomId, playerData) {
    io.to(roomId).emit('jakenWinner', JSON.stringify(playerData))
  }
}
