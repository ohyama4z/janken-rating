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
  sendHand (URL, jankenData) {
    io.to(URL).emit('sendHand', JSON.stringify({ jankenData }))
  }
}
