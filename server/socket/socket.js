const mysql2 = require('mysql2/promise')
// const saltRounds = 10
const dest = {
  host: 'mysql',
  user: 'janken',
  password: 'rating',
  database: 'janken_rating'
}

module.exports = (io) => {
  io.sockets.on('connection', (socket) => {
    socket.on('watchRoom', (json) => {
      const data = JSON.parse(json)
      mysql2.createConnection(dest).then(conn => {
        return Promise.all([
          conn,
          conn.query('SELECT `id` FROM `session` WHERE `token`=?', [data.token])
        ])
      }).then(([conn, [res]]) => {
        if (res.length === 0) {
          return Promise.reject(new Error('invalidToken'))
        }
        return conn.query('SELECT `player_id` FROM `room_players` WHERE `room_id`=? AND `player_id`=?', [data.roomId, res.id])
      }).then(res => {
        if (res.length === 0) {
          return Promise.reject(new Error('notJoined'))
        }
        socket.join(data.roomId)
        console.log('watchRoom!!!!')
        // res.status(200).json({ status: 'ok' })
      }).catch(err => {
        console.log(err)
      })
    })
    socket.on('startGame', (json) => {
      mysql2.createConnection(dest).then(conn => {
        return conn.query('')
      })
    })
  })
}
