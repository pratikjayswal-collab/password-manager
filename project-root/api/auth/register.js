// api/auth/register.js
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('../../utils/database');

module.exports = async (req, res) => {
  // ── CORS HEADERS ───────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  }

  try {
    // ── CONNECT TO DATABASE ─────────────────────────────────────────────────
    const { db } = await connectToDatabase();
    console.log('✅ MongoDB connected for registration');

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'All fields (username, email, password) are required' });
    }

    const users = db.collection('users');
    const existing = await users.findOne({
      $or: [{ email }, { username }]
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'User with that email or username already exists' });
    }

    // ── HASH PASSWORD & INSERT ────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const result = await users.insertOne({
      username,
      email,
      password: hashed,
      createdAt: new Date()
    });

    return res
      .status(201)
      .json({
        message: 'User registered successfully',
        userId: result.insertedId
      });

  } catch (err) {
    console.error('❌ Registration error:', err);
    return res
      .status(500)
      .json({ message: 'Server error during registration' });
  }
};
