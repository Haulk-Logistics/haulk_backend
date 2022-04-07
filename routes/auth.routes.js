// Authentication Routes

const express = require("express");
const router = express.Router();


// authentication controller
const authController = require("../controllers/auth.controller");


// auth routes
router.post('/signup', authController.signup);


module.exports = router;