const io
module.exports.listen = socketIo => {
  io = socketIo
}
module.exports.notif = {
    joined (roomId, playerData) {
      io.to(roomId).emit('playerData', JSON.stringify(playerData))
    }
}