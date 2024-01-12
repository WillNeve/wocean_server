const jwt = require('jsonwebtoken');

const isUserAuthorized = (token, userId) => {
  try {
    const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
    if (decodedUser.id === parseInt(userId, 10)) {
      return true;
    } else {
      return 401;
    }
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return 500;
  }
}

module.exports = {
  isUserAuthorized,
}
