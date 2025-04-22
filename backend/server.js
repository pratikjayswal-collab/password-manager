const express = require('express')
const dotenv = require('dotenv')
const { MongoClient, ObjectId } = require('mongodb')
const bodyparser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

dotenv.config()

// Connection URL
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const client = new MongoClient(url)

// Database Name
const dbName = 'passop'
const app = express()
const port = process.env.PORT || 3000

// Configure CORS to accept requests from your Vercel domain
app.use(cors({
  origin: ['https://your-vercel-app-domain.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))

app.use(bodyparser.json())

// Connect to MongoDB
client.connect()
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(err => {
    console.error('MongoDB connection error:', err)
  })

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' })
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_default_jwt_secret')
    req.user = verified
    next()
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' })
  }
}

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    
    const db = client.db(dbName)
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
})

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }
    
    const db = client.db(dbName)
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
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'your_default_jwt_secret',
      { expiresIn: '24h' }
    )
    
    res.json({
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
})

// Get user profile
app.get('/api/auth/user', authenticateToken, async (req, res) => {
  try {
    const db = client.db(dbName)
    const usersCollection = db.collection('users')
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } } // Exclude password
    )
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ message: 'Server error fetching user data' })
  }
})

// PROTECTED ROUTES FOR PASSWORD MANAGEMENT
// Apply authentication middleware to all password routes
app.use('/api/passwords', authenticateToken)

// Get all passwords for the authenticated user
app.get('/api/passwords', async (req, res) => {
  try {
    const db = client.db(dbName)
    const collection = db.collection('passwords')
    const findResult = await collection.find({ userId: req.user.id }).toArray()
    res.json(findResult)
  } catch (error) {
    console.error('Error fetching passwords:', error)
    res.status(500).json({ message: 'Server error fetching passwords' })
  }
})

// Save a password
app.post('/api/passwords', async (req, res) => {
  try {
    const password = {
      ...req.body,
      userId: req.user.id // Associate password with the user
    }
    const db = client.db(dbName)
    const collection = db.collection('passwords')
    const findResult = await collection.insertOne(password)
    res.send({ success: true, result: findResult })
  } catch (error) {
    console.error('Error saving password:', error)
    res.status(500).json({ message: 'Server error saving password' })
  }
})

// Delete a password by id
app.delete('/api/passwords/:id', async (req, res) => {
  try {
    const db = client.db(dbName)
    const collection = db.collection('passwords')
    
    // Only delete if the password belongs to the authenticated user
    const findResult = await collection.deleteOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.user.id
    })
    
    if (findResult.deletedCount === 0) {
      return res.status(404).json({ message: 'Password not found or unauthorized' })
    }
    
    res.send({ success: true, result: findResult })
  } catch (error) {
    console.error('Error deleting password:', error)
    res.status(500).json({ message: 'Server error deleting password' })
  }
})

// Keep the legacy endpoints for backward compatibility, but they now require auth
app.get('/', authenticateToken, async (req, res) => {
  try {
    const db = client.db(dbName)
    const collection = db.collection('passwords')
    const findResult = await collection.find({ userId: req.user.id }).toArray()
    res.json(findResult)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/', authenticateToken, async (req, res) => {
  try {
    const password = {
      ...req.body,
      userId: req.user.id
    }
    const db = client.db(dbName)
    const collection = db.collection('passwords')
    const findResult = await collection.insertOne(password)
    res.send({ success: true, result: findResult })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

app.delete('/', authenticateToken, async (req, res) => {
  try {
    const password = {
      ...req.body,
      userId: req.user.id
    }
    const db = client.db(dbName)
    const collection = db.collection('passwords')
    const findResult = await collection.deleteOne(password)
    res.send({ success: true, result: findResult })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`Password manager server running on http://localhost:${port}`)
})