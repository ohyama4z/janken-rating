const mysql = require('mysql')
// const saltRounds = 10
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pu-sannoho-muranda-bi-',
  database: 'janken_rating'
})

module.exports = (io) => {
  io.sockets.on('connection', (socket) => {
    socket.on('watchRoom', (json) => {
      const data = JSON.parse(json)
      connection.query('SELECT `id` FROM `session` WHERE `token`=?', [data.token], (res, err) => {
        if (err) {
          return
        }
        socket.join(data.roomId)
      })
    })
  })
}
