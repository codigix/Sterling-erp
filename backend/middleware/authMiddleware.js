const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  if (token === 'demo-token') {
    // For demo users, we try to use the ID that might be in the request headers or just default to 1
    // A better way is to decode the user from a simulated token if we had one, 
    // but for now we'll allow the controllers to handle the ID from the URL params.
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
