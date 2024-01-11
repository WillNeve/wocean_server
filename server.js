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

app.use('/test-route', (req, res) => {
  res.status(200).json({message: 'Deployed API working well :D'})
})

app.use('/', userRoutes)
app.use('/', noteRoutes)
// ----------------


// ---- Start listening for requests --------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// ---------------
