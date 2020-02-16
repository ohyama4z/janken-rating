module.exports = {
  databaseDest: {
    host: 'mysql',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'janken_rating'
  },
  awsS3: {
    accessKeyId: process.env. MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY ,
    endpoint: 'http://minio:9000' ,
    s3ForcePathStyle: true, // needed with minio?
    signatureVersion: 'v4'
  }
}