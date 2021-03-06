const express = require('express');
const colors = require('colors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const cookieSession = require('cookie-session');
const userRoute = require('./routes/user');
const socialRoute = require('./routes/social');
const newsRoute = require('./routes/news');
const pollRoute = require('./routes/poll');
const errorHandler = require('./middleware/error');
const connect = require('./config/db');
const cors = require('cors');

dotenv.config({ path: './config/config.env' });

connect.connectDB();

const app = express();
app.use(cors());

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

app.get('/', (req, res) => res.send('welcome to product plus'));

//Route Files
const user = app.use('/api/v1/', userRoute);
const social = app.use('/api/v1/social/', socialRoute);
const news = app.use('/api/v1/news/', newsRoute);
const poll = app.use('/api/v1/poll/', pollRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`.yellow.underline.bold);
});

module.exports = app;
