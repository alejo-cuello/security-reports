const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const claimController = require('../controllers/claimController');

router.get('/', verifyToken, claimController.getClaims);
router.post('/', verifyToken, claimController.createClaim);
router.delete('/:claimId', verifyToken, claimController.deleteClaim);

module.exports = router;