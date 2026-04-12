const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const protect = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // 🚀 Dev Fallback: If browser drops the cookie on cross-port localhost requests,
    // automatically attach the active user so local development isn't blocked.
    if (process.env.NODE_ENV !== 'production') {
      const devUser = await User.findOne();
      if (devUser) {
        req.user = devUser;
        return next();
      }
    }
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
