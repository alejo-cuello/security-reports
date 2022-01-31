const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const contactController = require('../controllers/contactController');

router.post('/', verifyToken, contactController.newContact);

module.exports = router;