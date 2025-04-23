// api/_utils/auth.js
const jwt = require('jsonwebtoken')

function authenticateToken(req, res) {
  return new Promise((resolve, reject) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    if (!token) {
      return reject({
        status: 401,
        message: 'Access denied. No token provided.'
      })
    }
    
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_default_jwt_secret')
      resolve(verified)
    } catch (error) {
      reject({
        status: 403,
        message: 'Invalid token'
      })
    }
  })
}

module.exports = { authenticateToken }