const express = require('express');
const router = express.Router();
const insecurityFactTypeController = require('../controllers/insecurityFactTypeController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, insecurityFactTypeController.getInsecurityFactTypes);

module.exports = router;