const { pool } = require('../db/dbConfig');
const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const validateInputs = (userInfos) => {
  const errors = {username: ['sdfsdfs', 'sdfsdf']};
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
  const result = await pool.query('SELECT * FROM wocean_users WHERE email = $1;', [userInfos.email]);
  const requestedUser = result.rows[0];
  const match = await bcrypt.compare(userInfos.password, requestedUser.password);
  if (match) {
    return {
      id: requestedUser.id,
      username: requestedUser.username,
      email: requestedUser.email
    }
  } else {
    return false;
  }
  // return result.rows[0];
}


const getStats = async (req, res) => {
  const userId = req.params.user_id;
  const resp = await pool.query(`SELECT
  COUNT(*) AS total,
  SUM(CASE WHEN folder = true THEN 1 ELSE 0 END) AS folders,
  SUM(CASE WHEN folder = false THEN 1 ELSE 0 END) AS notes
FROM notes
WHERE user_id = ${userId};`)
const count = resp.rows[0];
  const stats =  {
    files: {
      total: count.total,
      title: 'Your files',
      data: [['Notes', count.notes], ['Folders', count.folders]],
    }
  };
  res.status(200).json({stats: stats})
}

const authenticate = async (req, res) => {
  const userInfos = {
    email: req.body.email,
    password: req.body.password,
  }
  const jwtSecret = process.env.JWT_SECRET_KEY;
  // validate user credentials
  const user = await validateCredentials(userInfos);
  // tokenise user credentials
  if (user) {
    const token = jwt.sign(user.id, jwtSecret);
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
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(userInfos.password, salt);
      userInfos.password = hashedPassword;
      userInfos.salt = salt;
      const newUserId = await userModel.create(userInfos);
      const jwtSecret = process.env.JWT_SECRET_KEY;
      const token = jwt.sign(newUserId, jwtSecret);
      res.status(201).json({user: {...userInfos, token: token}})
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
  authenticate,
  getStats
}
