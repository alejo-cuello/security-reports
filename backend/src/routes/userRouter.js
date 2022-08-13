const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');
const passport = require('passport');


router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.get('/signup/confirmEmail/:token', userController.confirmEmailSignup);
router.put('/editProfileData/:userId', verifyToken, userController.editProfileData);
router.put('/changePassword', userController.changePassword);
router.get('/changePassword/confirmEmail/:token', userController.confirmEmailChangePassword);

router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', 
    passport.authenticate('facebook', {
        failureRedirect: `${process.env.CLIENT_URL}/login`
    }),
    userController.preLoginWithSocialMedia
);

router.post('/loginWithSocialMedia', verifyToken, userController.loginWithSocialMedia);

module.exports = router;