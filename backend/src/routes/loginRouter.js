const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/login', loginController.login);
router.post('/signup', loginController.signup);
router.get('/signup/confirmEmail/:token', loginController.confirmEmailSignup);
router.put('/changePassword', loginController.changePassword);
router.get('/changePassword/confirmEmail/:token', loginController.confirmEmailChangePassword);

module.exports = router;