let io
module.exports.listen = socketIo => {
  io = socketIo
}
module.exports.notif = {
  joined (roomId, playerData) {
    io.to(roomId).emit('playerData', JSON.stringify(playerData))
    //console.log(roomId, playerData)
  },

  startedGame (roomId, URL) {
    const roomMembers = io.sockets.clients(roomId)
    roomMembers.forEach(roomMember => {
      io[roomMember].leave(roomId)
      io[roomMember].join(URL).emit('started', JSON.stringify({ matchURL: URL }))
    })
  }
}
