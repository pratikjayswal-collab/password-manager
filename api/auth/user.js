// api/auth/user.js
const { ObjectId } = require('mongodb')
const connectToDatabase = require('../_utils/database')
const { authenticateToken } = require('../_utils/auth')

export default async function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const user = await authenticateToken(req, res)
    
    const { db } = await connectToDatabase()
    const usersCollection = db.collection('users')
    
    const userDoc = await usersCollection.findOne(
      { _id: new ObjectId(user.id) },
      { projection: { password: 0 } } // Exclude password
    )
    
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    res.status(200).json(userDoc)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error('Error fetching user:', error)
    res.status(500).json({ message: 'Server error fetching user data' })
  }
}