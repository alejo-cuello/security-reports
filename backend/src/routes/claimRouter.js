const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const uploadImageErrorHandler = require('../middlewares/uploadImageErrorHandler');
const claimController = require('../controllers/claimController');


// Rutas del Agente Municipal
router.get('/pending', verifyToken, claimController.getPendingClaims);

router.get('/takenClaims', verifyToken, claimController.getTakenClaims);

router.put('/updateStatus/:claimId', verifyToken, claimController.changeClaimStatus);


// Rutas del Vecino
router.get('/favorites', verifyToken, claimController.getFavoriteClaims);

router.get('/:claimId', verifyToken, claimController.getClaimById);

// * Se usa tanto para crear un nuevo reclamo como un nuevo hecho de inseguridad
router.post('/', verifyToken, uploadImageErrorHandler, claimController.createClaim);

// * Se usa tanto para actualizar un reclamo como un hecho de inseguridad
router.put('/:claimId', verifyToken, uploadImageErrorHandler, claimController.editClaim);

router.delete('/:claimId', verifyToken, claimController.deleteClaim);


module.exports = router;