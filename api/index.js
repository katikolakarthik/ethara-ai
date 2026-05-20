require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const serverless = require('serverless-http');
const app = require('../backend/src/app');

module.exports = serverless(app);
