const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, fileController.getBase64FromUrl);

module.exports = router