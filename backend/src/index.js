require('dotenv').config();
const express = require('express');
const sequelize = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');


const PORT = process.env.PORT || 8080;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());