const express = require('express');
const cors = require('cors');
const contentRoutes = require('./routes/contentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', contentRoutes);

module.exports = app;
