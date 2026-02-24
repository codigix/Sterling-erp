const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  if (token === 'demo-token') {
    const demoUsername = req.header('X-Demo-User');
    
    if (demoUsername) {
      try {
        const [users] = await pool.execute(`
          SELECT u.id, u.username, r.name as role 
          FROM users u 
          JOIN roles r ON u.role_id = r.id 
          WHERE u.username = ? OR u.username = ?
        `, [demoUsername, demoUsername.replace(/\./g, '_')]);
        
        if (users.length > 0) {
          req.user = { 
            id: users[0].id, 
            username: users[0].username, 
            role: users[0].role, 
            type: 'user', 
            isDemo: true 
          };
          return next();
        }
      } catch (err) {
        console.error('Error resolving demo user:', err);
      }
    }
    
    // Default fallback if header missing or user not found
    req.user = { id: 1, role: 'Admin', type: 'user', isDemo: true };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
