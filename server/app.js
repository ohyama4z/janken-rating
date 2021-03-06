const AWS = require('aws-sdk')
const s3  = new AWS.S3({
    accessKeyId: 'YOUR-ACCESSKEYID' ,
    secretAccessKey: 'YOUR-SECRETACCESSKEY' ,
    endpoint: 'https://minio.jankenrating.tk' ,
    s3ForcePathStyle: true, // needed with minio?
    signatureVersion: 'v4'
})
const express = require('express')
// const multer = require('multer')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const registerRouter = require('./routes/register')
const loginRouter = require('./routes/login')
const roomsRouter = require('./routes/rooms')
const profileRouter = require('./routes/profile')
// const waitingRouter = require('./routes/waiting')
require('./socket/socket')(io)
require('./socket/notif').listen(io)

app.use(logger('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// app.use(multer({ dest: './uploads/' }))

app.use('/api/register', registerRouter)
app.use('/api/login', loginRouter)
app.use('/api/rooms', roomsRouter)
app.use('/api/profile', profileRouter)
// app.use('/api/waiting', waitingRouter)
// app.listen(3000)
http.listen(3000)
module.exports = app
