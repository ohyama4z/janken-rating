const express = require('express')
const multer  = require('multer')
const router = express.Router()
const mysql = require('mysql')
const bcrypt = require('bcrypt')
// const saltRounds = 10
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pu-sannoho-muranda-bi-',
  database: 'janken_rating'
})

router.get('/', (req, res) => {

})

// コメント
// localhost:8080/api/profile/comment?token=トークン&content=こめんと
router.put('/comment', (req, res) => {
  connection.query()
  // console.log(req.files)
})

// アイコン
// localhost:8080/api/profile/icon
router.put('/icon', (req, res) => {
  console.log(req.files)
})

module.exports = router
