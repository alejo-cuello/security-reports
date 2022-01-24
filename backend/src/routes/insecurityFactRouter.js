const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const claimController = require('../controllers/claimController');

router.get('/', verifyToken, claimController.getInsecurityFacts);
router.get('/:claimId', verifyToken, claimController.getInsecurityFactById);
router.post('/', verifyToken, claimController.createClaim);
router.put('/:claimId', verifyToken, claimController.editClaim);
router.delete('/:claimId', verifyToken, claimController.deleteInsecurityFact);

module.exports = router;