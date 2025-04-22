// api/auth/register.js
const bcrypt = require('bcryptjs')
const connectToDatabase = require('../_utils/database')

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { username, email, password } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    
    const { db } = await connectToDatabase()
    const usersCollection = db.collection('users')
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [{ email }, { username }] 
    })
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create new user
    const result = await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    })
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertedId
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
}