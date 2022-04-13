// Authentication Routes

const express = require("express");
const router = express.Router();


// authentication controller
const authController = require("../controllers/auth.controller");


// auth routes

// signup
router.post('/signup', authController.signup);

// SignIn
router.post('/signin', authController.signin);

// verify user
router.get('/verifyUser/', authController.verifyUser);
router.put('/resendVerificationEmail', authController.resendVerificationEmail);

// reset password
router.post('/sendResetPasswordEmail', authController.sendResetPasswordMail);
router.post('/resetPassword/', authController.changePassword);

module.exports = router;