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
  finished (roomId) {
    io.to(roomId).emit('finished')
  }
}
