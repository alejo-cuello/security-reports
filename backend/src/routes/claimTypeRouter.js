const express = require('express');
const router = express.Router();
const claimTypeController = require('../controllers/claimTypeController');

router.get('/', claimTypeController.getClaimTypesWithSubcategories);

module.exports = router;