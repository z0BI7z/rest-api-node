const express = require('express');
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');

app = express();

app.use(bodyParser.json());

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

app.listen(3000);