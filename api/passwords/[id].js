// api/passwords/[id].js
const { ObjectId } = require('mongodb')
const { authenticateToken } = require('../_utils/auth')
const connectToDatabase = require('../_utils/database')

export default async function handler(req, res) {
  try {
    // Verify authentication first
    const user = await authenticateToken(req, res)
    const { db } = await connectToDatabase()
    const collection = db.collection('passwords')
    
    // Get the password ID from the URL
    const { id } = req.query
    
    // Handle DELETE request
    if (req.method === 'DELETE') {
      // Only delete if the password belongs to the authenticated user
      const findResult = await collection.deleteOne({ 
        _id: new ObjectId(id),
        userId: user.id
      })
      
      if (findResult.deletedCount === 0) {
        return res.status(404).json({ message: 'Password not found or unauthorized' })
      }
      
      return res.status(200).json({ success: true, result: findResult })
    }
    
    // Method not allowed
    return res.status(405).json({ message: 'Method not allowed' })
    
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message })
    }
    console.error('Error with password operation:', error)
    res.status(500).json({ message: 'Server error processing request' })
  }
}