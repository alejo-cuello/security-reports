require('dotenv').config();
require('./database/db-connection');
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const router = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const PORT = process.env.PORT || 8080;

// Google Authentication
require('./config/googleAuthConfig')(passport);

const app = express();

// Session for Google Authentication
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

// Middleware
app.use(express.static('../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session())


// Routes
app.use(router);


// Error Handler
app.use(errorHandler);


// Server
app.listen( PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server running on: http://localhost:${PORT}/`);
});