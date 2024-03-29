const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const mapController = require('../controllers/mapController');

router.get('/getAddress/:lat&:lng', verifyToken, mapController.getAddress);

module.exports = router;