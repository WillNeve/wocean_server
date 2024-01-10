//express
const express = require('express');

// initialise server
const app = express();
const port = process.env.PORT || 5000;

// ------- middlewares ----------
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
  // form data handling
const upload = multer();
app.use(upload.none());
// ---------

// -------  add route handlers -------------
const { userRoutes } = require('./routes/users');

app.use('/', userRoutes)
// ----------------

// ---- Start listening for requests --------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// ---------------

const { compareCredentials } = require('./controllers/users')
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJ0dGVzdCIsImVtYWlsIjoid2lsbEB3aWxsLmNvbSIsInBhc3N3b3JkIjoiMTIzMTIzIiwiaWF0IjoxNzA0ODUxNTgxfQ.uU0l3tyjbGYkqNLgklMkonls_3PpE2DIlqkUvYs60Lg"
compareCredentials(token, 3);
