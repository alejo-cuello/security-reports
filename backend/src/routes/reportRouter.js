const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const reportController = require('../controllers/reportController');

router.get('/byInsecurityFactType', verifyToken, reportController.getReportByInsecurityFactType);

router.get('/byClaimType', verifyToken, reportController.getReportByClaimType);

router.get('/byMunicipalAgent', verifyToken, reportController.getReportByMunicipalAgent);

module.exports = router;