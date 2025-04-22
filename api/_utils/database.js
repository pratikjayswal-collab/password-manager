// api/_utils/database.js
const { MongoClient } = require('mongodb')
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = 'passwordManager'

let cachedClient = null
let cachedDb = null

async function connectToDatabase() {
  // If we have a cached connection, use it
  if (cachedClient && cachedDb) {
    return {
      client: cachedClient,
      db: cachedDb
    }
  }

  // If no cached connection, create a new one
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const db = client.db(dbName)
  
  // Cache the connection
  cachedClient = client
  cachedDb = db
  
  return {
    client,
    db
  }
}

module.exports = connectToDatabase