const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('../../utils/database');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  try {
    // 🔥 Parse JSON body manually
    let body = '';
    await new Promise((resolve) => {
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', resolve);
    });
    const { username, email, password } = JSON.parse(body);

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const { db } = await connectToDatabase();
    const users = db.collection('users');
    const existing = await users.findOne({ $or: [{ email }, { username }] });

    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      username,
      email,
      password: hashed,
      createdAt: new Date()
    });

    return res.status(201).json({ message: 'User registered', userId: result.insertedId });

  } catch (err) {
    console.error('❌ Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
