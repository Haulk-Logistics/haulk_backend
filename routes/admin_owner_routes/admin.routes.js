// Admin Routes


const express = require("express");
const router = express.Router();


// admin controller
const adminController = require("../../controllers/admin.controller");

// Admin Signup
router.post("/auth/signup", adminController.signup);


// Admin Signin
router.post("/auth/signin", adminController.signIn);
// router.get("/getAllAdmins", adminController.getAllAdmins);



module.exports = router;