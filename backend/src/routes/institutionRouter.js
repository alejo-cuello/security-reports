const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/security', verifyToken, institutionController.getSecurityInstitutions);
router.get('/health', verifyToken, institutionController.getHealthInstitutions);

module.exports = router;