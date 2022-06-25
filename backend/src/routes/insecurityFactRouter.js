const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const claimController = require('../controllers/claimController');

router.get('/', verifyToken, claimController.getFavoriteInsecurityFacts);

router.get('/insecurityFactsForMap', verifyToken, claimController.getInsecurityFactsForMap);

router.get('/:claimId', verifyToken, claimController.getInsecurityFactById);

router.delete('/:claimId', verifyToken, claimController.deleteInsecurityFact);

module.exports = router;