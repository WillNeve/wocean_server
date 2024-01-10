const { pool } = require('../db/dbConfig');
const userModel = require('../models/user')

const validateInputs = (userInfos) => {
  const errors = {};

  // presence checks
  if (!userInfos.username) {
    if (errors.username) {
      errors.username.push('Username must be provided')
    } else {
      errors.username = ['Username must be provided']
    }
  }

  if (!userInfos.email) {
    if (errors.email) {
      errors.email.push('Email must be provided')
    } else {
      errors.email = ['Email must be provided']
    }
  }

  if (!userInfos.password) {
    if (errors.password) {
      errors.password.push('Password must be provided')
    } else {
      errors.password = ['Password must be provided']
    }
  }

  //username

  //email
  const emailPattern = /^\w+@\w+(\.\w+)+$/
  if (!emailPattern.test(userInfos.email)) {
    if (errors.email) {
      errors.email.push('Email does not match required format')
    } else {
      errors.email = ['Email does not match required format']
    }
  }

  // password validations
  if (userInfos.password !== userInfos.password_confirmation) {
    if (errors.password) {
      errors.password.push('Passwords do not match')
    } else {
      errors.password = ['Passwords do not match']
    }
  }

  // final calc
  return errors;
}


const validateCredentials = async (userInfos) => {
  const result = await pool.query('SELECT * FROM wocean_users WHERE email = $1 AND password = $2;', [userInfos.email, userInfos.password]);
  return result.rows[0];
}

const isUserAuthorized = (token, userId) => {
  try {
    const decodedUser = jwt.verify(token, process.env.SECRET_KEY);
    if (decodedUser.id === userId) {
      return true;
    } else {
      return 401;
    }
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return 500;
  }
}

const jwt = require('jsonwebtoken');

const authorize = async (req, res) => {
  const userInfos = {
    email: req.body.email,
    password: req.body.password,
  }

  console.log('User information:', userInfos);
  const secretKey = process.env.SECRET_KEY;
  // validate user credentials
  const user = await validateCredentials(userInfos);
  // tokenise user credentials
  if (user) {
    const token = jwt.sign(user, secretKey);
    res.status(200).json({user: {...user, token: token}})
  } else {
    res.status(401).json({message: 'oh noo....'})
  }
}

const register = async (req, res) => {
  const userInfos = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    password_confirmation: req.body.password_confirmation
  }
  const validationErrors = validateInputs(userInfos);
  if (Object.keys(validationErrors).length === 0) {
    try {
      const newUser = await userModel.create(userInfos)
      res.status(201).json({user: newUser})
    } catch (error) {
      console.error('Error inserting user:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    console.error('User field(s) invalid:', validationErrors);
    res.status(422).json({errors: validationErrors})
  }
}

module.exports = {
  register,
  authorize,
  compareCredentials
}