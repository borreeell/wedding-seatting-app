const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const routes = require('./routes/api');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/colorovaapp.pl/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/colorovaapp.pl/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/colorovaapp.pl/chain.pem'),
};

https.createServer(options, app).listen(3000, () => {
    console.log('Backend server running on: https://localhost:3000');
});