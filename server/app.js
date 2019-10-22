const express = require('express')
// const multer = require('multer')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const registerRouter = require('./routes/register')
const loginRouter = require('./routes/login')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
// app.use(multer({ dest: './uploads/' }))

app.use('/api/register', registerRouter)
app.use('/api/login', loginRouter)
app.listen(3000)
module.exports = app
