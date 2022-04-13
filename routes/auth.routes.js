// Authentication Routes

const express = require("express");
const router = express.Router();
const validatorer = require('express-validator');
const req = require("express/lib/request");


//body validator
const body = validatorer.body;

// validationResult function
const validationResult = validatorer.validationResult;


// authentication controller
const authController = require("../controllers/auth.controller");


// signup
router.post('/signup',
    body('email').isEmail().not().isEmpty().withMessage('email is required').toLowerCase(),
    body('phoneNumber').not().isEmpty().isMobilePhone('en-NG').withMessage('phoneNumber is invalid'),
    body('password').not().isEmpty().isLength({
        min: 6
    }).withMessage('Password must be at least 6 characters long').toLowerCase(),
    authController.signup);

// SignIn
router.post('/signin',
    body('email').isEmail().withMessage('email is required').toLowerCase(),
    body('password').not().isEmpty().withMessage('password is required').toLowerCase(), authController.signin);

// verify user
router.get('/verifyUser/', authController.verifyUser);
router.put('/resendVerificationEmail',
    body('email').not().isEmpty().isEmail().withMessage('Email is required').toLowerCase(),
    authController.resendVerificationEmail);

// reset password
router.post('/sendResetPasswordEmail', authController.sendResetPasswordMail);


router.post('/resetPassword/',
    body('email').not().isEmpty().isEmail().withMessage('email is required').toLowerCase(),
    body('newPassword').not().isEmpty().isLength({
        min: 6
    }).withMessage('New Password must be at least 6 characters long'),
    authController.changePassword);

module.exports = router;