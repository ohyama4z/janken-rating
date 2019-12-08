module.exports = {
  databaseDest: {
    host: 'mysql',
    user: 'janken',
    password: 'rating',
    database: 'janken_rating'
  },
  awsS3: {
    accessKeyId: 'janken-rating' ,
    secretAccessKey: 'password' ,
    endpoint: 'http://minio:9000' ,
    s3ForcePathStyle: true, // needed with minio?
    signatureVersion: 'v4'
  }
}