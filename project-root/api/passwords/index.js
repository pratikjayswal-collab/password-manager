// api/passwords/index.js
const { authenticateToken } = require('../../utils/auth')
const connectToDatabase = require('../../utils/database')

export default async function handler(req, res) {
  try {
    // Verify authentication first
    const user = await authenticateToken(req, res)
    const { db } = await connectToDatabase()
    const collection = db.collection('passwords')

    // Handle GET - Get all passwords
    if (req.method === 'GET') {
      const findResult = await collection.find({ userId: user.id }).toArray()
      return res.status(200).json(findResult)
    }
    
    // Handle POST - Create a new password
    if (req.method === 'POST') {
      const password = {
        ...req.body,
        userId: user.id // Associate password with the user
      }
      const findResult = await collection.insertOne(password)
      return res.status(201).json({ success: true, result: findResult })
    }
    
    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' })
    
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error('Error with passwords:', error)
    res.status(500).json({ message: 'Server error processing request' })
  }
}