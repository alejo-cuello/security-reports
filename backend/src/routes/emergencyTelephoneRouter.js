const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const emergencyTelephoneController = require('../controllers/emergencyTelephoneController');

router.get('/', emergencyTelephoneController.getEmergencyTelephones);

module.exports = router;