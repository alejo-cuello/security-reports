const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/login', loginController.login);
router.post('/signup', loginController.signup);
router.put('/changePassword', loginController.changePassword);
router.get('/changePassword/confirmEmail/:token', loginController.confirmEmailChangePassword);
// FIXME: Cambiar el nombre de la ruta por /signup/confirmEmail y el método del controller por confirmEmailSignup. Ubicarla entre la línea 6 y 7.
router.get('/confirmEmail/:token', loginController.confirmEmail);

module.exports = router;