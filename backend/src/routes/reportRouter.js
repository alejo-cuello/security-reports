const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const reportController = require('../controllers/reportController');

router.get('/reportByDateRange', verifyToken, reportController.getReport);

module.exports = router;