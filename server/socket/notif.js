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
  updateInfo (id, players, data) {
    const sendData = {
      players,
      finishAt: data.finishAt,
      startedAt: data.startedAt,
      aiko: data.aiko,
    }
    console.log(data, sendData)
    io.to(id).emit(`updateInfo`, JSON.stringify(sendData))
  },
  finish (roomId) {
    io.to(roomId).emit('finished')
  }
}
