// Authentication Routes

const express = require("express");
const router = express.Router();


// authentication controller
const authController = require("../controllers/auth.controller");


// auth routes
router.post('/signup', authController.signup);
router.put('/verifyUser/', authController.verifyUser);
router.put('/resendVerificationEmail', authController.resendVerificationEmail);


module.exports = router;