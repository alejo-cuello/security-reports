const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const reportController = require('../controllers/reportController');

router.get('/insecurityFactType', verifyToken, reportController.getReportByInsecurityFactType);

router.get('/claimType', verifyToken, reportController.getReportByClaimType);

module.exports = router;