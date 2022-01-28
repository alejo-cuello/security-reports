const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const uploadImageErrorHandler = require('../middlewares/uploadImageErrorHandler');
const claimController = require('../controllers/claimController');


router.get('/favorites', verifyToken, claimController.getFavoriteClaims);
router.get('/pending', verifyToken, claimController.getPendingClaims);
router.get('/:claimId', verifyToken, claimController.getClaimById);
router.post('/', verifyToken, uploadImageErrorHandler, claimController.createClaim);
router.put('/:claimId', verifyToken, uploadImageErrorHandler, claimController.editClaim);
router.put('/updateStatus/:claimId', verifyToken, claimController.changeStatusToClaim);
router.delete('/:claimId', verifyToken, claimController.deleteClaim);

module.exports = router;