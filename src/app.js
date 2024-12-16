const express = require('express');

const app = express();

app.use(express.static('static'));
app.use('/node_modules/bootstrap/dist', express.static('node_modules/bootstrap/dist'));

module.exports = app;
