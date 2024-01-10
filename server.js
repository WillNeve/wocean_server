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

app.use('/test-route', (req, res) => {
  res.status(200).json({message: 'Deployed API working well :D'})
})

app.use('/note/:id', (req, res) => {
  const responseObj = {
    message: 'your request for note #2 was succesful',
    page: {
      title: 'A strong title',
      body: '<div>Test</div><div>Test</div><div>sdfsdf</div><div>sdf</div><div>sdf</div><div>sd</div><div>fs</div><div>df</div><div>sd</div><div>f</div><div>sd</div><div>f</div><div>------------</div><p>some text</p>'
    }
  }
  res.status(200).json(responseObj)
})

app.use('/', userRoutes)
// ----------------


// ---- Start listening for requests --------
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// ---------------
