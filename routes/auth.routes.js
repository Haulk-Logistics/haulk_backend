// Authentication Routes

const express = require("express");
const router = express.Router();


// authentication controller
const authController = require("../controllers/auth.controller");


// auth routes

// signup
router.post('/signup', authController.signup);
router.get('/verifyUser/', authController.verifyUser);
router.put('/resendVerificationEmail', authController.resendVerificationEmail);


module.exports = router;