const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/', [], loginController.login); // TODO: Ver el middleware de autenticación
router.post('/', [], loginController.signup);
router.get('/:token', [], loginController.confirmEmail);

module.exports = router;