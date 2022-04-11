// Authentication Routes

const express = require("express");
const router = express.Router();


// authentication controller
const authController = require("../controllers/auth.controller");


// auth routes

// signup
/**
 * @swagger
 * /api/auth/signup:
 *   get:
 *     summary: Create A User Account
 *     description: Create Truck Driver Or Cargo Owner Account 
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: sort
 *         type: string
 *         required: false
 *         enum:
 *           - yes
 *           - no
 *     responses:
 *       200:
 *         description: List of animals
 *         schema:
 *           type: object
 *           properties:
 *             animals:
 *               type: array
 *               description: all the animals
 *               items:
 *                 type: string
 */
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