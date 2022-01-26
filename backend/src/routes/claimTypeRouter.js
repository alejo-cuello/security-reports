const express = require('express');
const router = express.Router();
const claimTypeController = require('../controllers/claimTypeController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, claimTypeController.getClaimTypesWithSubcategories);

module.exports = router;