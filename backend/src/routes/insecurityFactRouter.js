const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const claimController = require('../controllers/claimController');

router.get('/', verifyToken, claimController.getFavoriteInsecurityFacts);

router.get('/insecurityFactsForMapForNeighbor', verifyToken, claimController.getInsecurityFactsForMapForNeighbor);

router.get('/insecurityFactsForMapForMunicipalAgent', verifyToken, claimController.getInsecurityFactsForMapForMunicipalAgent);

router.get('/:claimId', verifyToken, claimController.getInsecurityFactById);

router.delete('/:claimId', verifyToken, claimController.deleteInsecurityFact);

module.exports = router;