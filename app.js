const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

app = express();

app.use(bodyParser.json());
app.use('/images', express.static('images'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/', (req, res, next) => {
  res.status(200).json({
    message: 'Welcome'
  });
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.statusCode || 500).json({
    message: err.message,
    data: err.data
  });
});

const MONGODB_URI = 'mongodb://localhost:27017/node_complete_guide-rest';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    const server = app.listen(8080);
    require('./io').init(server).on('connection', () => {
      console.log('Connected client.')
    });
  })
  .catch(err => {
    console.log(err)
  });