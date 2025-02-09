require('dotenv').config()

let PORT = process.env.PORT
let MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.iydhe1m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

module.exports = {
  MONGODB_URI,
  PORT
}