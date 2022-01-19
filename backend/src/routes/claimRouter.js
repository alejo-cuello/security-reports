const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const claimController = require('../controllers/claimController');

router.get('/', verifyToken, claimController.getClaims);
router.post('/', verifyToken, claimController.createClaim);

module.exports = router;