const express = require('express');
const cors = require('cors');
const routes = require('./routes/api');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.listen(3000, () => {
    console.log('Backend server running on: http://localhost:3000');
});