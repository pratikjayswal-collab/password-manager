// api/auth/login.js
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const connectToDatabase = require('../../utils/database')

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }
    
    const { db } = await connectToDatabase()
    const usersCollection = db.collection('users')
    
    // Find user
    const user = await usersCollection.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username },
      process.env.JWT_SECRET || 'your_default_jwt_secret',
      { expiresIn: '24h' }
    )
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
}