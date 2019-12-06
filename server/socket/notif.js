let io
module.exports.listen = socketIo => {
  io = socketIo
}



module.exports.notif = {
  joined (roomId, playerData) {
    io.to(roomId).emit('playerData', JSON.stringify(playerData))
    //console.log(roomId, playerData)
  },

  startGame (roomId, URL) {
    io.in(roomId).clients((error, clients) => {
      if (error) throw error
      console.log(clients)
      clients.forEach(client => {
        const socket1 = io.of('/').connected[client]
        // socket取得
        socket1.leave(roomId)
        socket1.join(URL).emit('started', JSON.stringify({ matchURL: URL }))
      })
    })
    // const roomMembers = findClientsSocket(roomId)
    // console.log(roomMembers)
  }
}
