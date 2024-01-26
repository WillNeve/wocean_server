const jwt = require('jsonwebtoken');

const isUserAuthorized = (req, res, next) => {
  try {
    if (!(req.headers && req.headers.authorization)) {
      res.status(401).json({ message: 'Authorization header missing' });
    } else {
      const token = req.headers.authorization.replace('Bearer ', '')
      const resourceUserId = req.params.user_id;
      try {
        const decodedUserId = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decodedUserId) {
          const authorized = parseInt(decodedUserId, 10) === parseInt(resourceUserId, 10);
          if (authorized) {
            req.params.user_id = decodedUserId;
            next();
          } else {
            res.status(403).json({message: 'You are not authorized for this resource'});
          }
        } else {
          res.status(500).json({message: 'Your authorization token format is invalid'})
        }
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          res.status(401).json({ message: 'Token has expired'});
        } else {
          res.status(500).json({ message: 'Your authorization token is invalid'});
        }
      }
    }
  } catch (error) {
    res.status(500).json({message: 'We were unable to verify your authorization for this resource'});
  }
}

const isUserAuthenticated = (req, res, next) => {
  try {
    if (!(req.headers && req.headers.authorization)) {
      res.status(401).json({ message: 'Authorization header missing' });
    } else {
      const token = req.headers.authorization.replace('Bearer ', '')
      try {
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (decodedUser.id) {
          req.params.user_id = decodedUser.id;
          next();
        } else {
          res.status(500).json({message: 'Your authorization token format is invalid'})
        }
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          res.status(401).json({ message: 'Token has expired'});
        } else {
          res.status(500).json({ message: 'Your authorization token is invalid'});
        }
      }
    }
  } catch (error) {
    res.status(500).json({message: 'We were unable to verify your authorization'});
  }
}

module.exports = {
  isUserAuthorized,
  isUserAuthenticated
}
