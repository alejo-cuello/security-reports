require('dotenv').config();
require('./database/db-connection');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const morgan = require('morgan');
require('./config/imageCloudServer');


const PORT = process.env.PORT || 8080;

const app = express();


// Middleware
app.use(express.static('../public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// Format --> Request Method, URL, Status Code, Response Time - Size of the response body.
app.use(morgan("dev"));


// Routes
app.use(router);


// Error Handler
app.use(errorHandler);


// Server
app.listen( PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server running on: http://localhost:${PORT}/`);
});