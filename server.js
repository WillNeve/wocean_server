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
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
  // form data handling
const upload = multer();
app.use(upload.none());
// ---------

// -------  add route handlers -------------
const { userRoutes } = require('./routes/users');
const { noteRoutes } = require('./routes/notes');

app.use('/', userRoutes)
app.use('/', noteRoutes)

// -------- Sandbox (make sure to empty before deployment!) -----------

// const { isUserAuthorized } = require('./controllers/auth');

// app.get('/test-auth/:id', (req, res) => {
//   const incomingToken = req.headers.authorization.replace('Bearer ', '')
//   const authorized = isUserAuthorized(incomingToken, req.params.id);
//   if (authorized === true) {
//     res.status(200).json({message: 'You are authorized'})
//   } else if (authorized === 401) {
//     res.status(401).json({message: 'You are not authorized for this resource'})
//   } else {
//     res.status(500).json({message: 'We were unable to verify your authorization for this resource'})
//   }
// })

// ----------------


// ---- Start listening for requests --------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// ---------------
