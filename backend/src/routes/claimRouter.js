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

router.get('/claimById/:claimId', verifyToken, claimController.getClaimById);

router.get('/claimTracking/:claimId', verifyToken, claimController.getClaimTracking);

router.get('/claimsForMap', verifyToken, claimController.getClaimsForMap);

// * Se usa tanto para crear un nuevo reclamo como un nuevo hecho de inseguridad
router.post('/', verifyToken, uploadImageErrorHandler, claimController.createClaim);

// * Se usa tanto para marcar como favorito un reclamo como un hecho de inseguridad
router.post('/markClaimAsFavorite/:claimId', verifyToken, claimController.markClaimOrInsecurityFactAsFavorite);

// * Se usa tanto para actualizar un reclamo como un hecho de inseguridad
router.put('/:claimId', verifyToken, uploadImageErrorHandler, claimController.editClaim);

router.delete('/:claimId', verifyToken, claimController.deleteClaim);

// * Se usa para eliminar de favoritos tanto un reclamo como un hecho de inseguridad 
router.delete('/deleteClaimMarkedAsFavorite/:claimId', verifyToken, claimController.deleteClaimOrInsecurityFactMarkedAsFavorite);


module.exports = router;