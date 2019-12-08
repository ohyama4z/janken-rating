let io
module.exports.listen = socketIo => {
  io = socketIo
}



module.exports.notif = {
  joined (roomId, playerData) {
    io.to(roomId).emit('playerData', JSON.stringify(playerData))
    console.log('watch!?')
    //console.log(roomId, playerData)
  },
  sendHand (URL,jankenData) {
    io.to(URL).emit('sendHand', JSON.stringify({ jankenData }))
  }
}
