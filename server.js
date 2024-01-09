const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');

// database
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

// test database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
  done();
});

// initialise server
const app = express();
const port = process.env.PORT || 5000;

// general middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// form data handling
const upload = multer();
app.use(upload.none());


const validateInputs = (body) => {
  const errors = {};

  // presence checks
  if (!body.username) {
    if (errors.username) {
      errors.username.push('Username must be provided')
    } else {
      errors.username = ['Username must be provided']
    }
  }

  if (!body.email) {
    if (errors.email) {
      errors.email.push('Email must be provided')
    } else {
      errors.email = ['Email must be provided']
    }
  }

  if (!body.password) {
    if (errors.password) {
      errors.password.push('Password must be provided')
    } else {
      errors.password = ['Password must be provided']
    }
  }

  //username

  //email
  const emailPattern = /^\w+@\w+(\.\w+)+$/
  if (!emailPattern.test(body.email)) {
    if (errors.email) {
      errors.email.push('Email does not match required format')
    } else {
      errors.email = ['Email does not match required format']
    }
  }

  // password validations
  if (body.password !== body.password_confirmation) {
    if (errors.password) {
      errors.password.push('Passwords do not match')
    } else {
      errors.password = ['Passwords do not match']
    }
  }

  // final calc
  return errors;
}

app.post('/users', async (req, res) => {
  const validationErrors = validateInputs(req.body);
  if (Object.keys(validationErrors).length === 0) {
    try {
      const result = await pool.query(
        'INSERT INTO wocean_users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [req.body.username, req.body.email, req.body.password]
      );
      res.status(200).json({user: result.rows[0]})
    } catch (error) {
      console.error('Error inserting user:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    console.error('User field(s) invalid:', validationErrors);
    res.status(422).json({errors: validationErrors})
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
