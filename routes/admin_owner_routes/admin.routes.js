// Admin Routes


const express = require("express");
const router = express.Router();
const { isAdmin } = require('../../middlewares/auth.middlewares');


// admin controller
const adminController = require("../../controllers/admin.controller");

// Admin Signup
router.post("/auth/signup", adminController.signup);


// Admin Signin
router.post("/auth/signin", adminController.signIn);
// router.get("/getAllAdmins", adminController.getAllAdmins);

// Accept a truck driver
router.put("/driver/accept_driver/:driver_id", isAdmin, adminController.acceptTruckDriver);

// Reject a truck driver account / verification request
// router.put("/auth/reject/:id", isAdmin, adminController.rejectTruckDriver);

// View Haulk Total Drivers Accounts
// router.get("/auth/view/haulk_total_drivers", isAdmin, adminController.viewHaulkTotalDrivers);

// View Haulk Total Cargo Owners Accounts

// View Haulk Total Completed Orders

// api that returns total driver (Approved, Declined, Awaiting Approval)

// api that returns list of truck drivers awaiting approval
router.get("/driver/awaiting_approval", isAdmin, adminController.getUnverifiedDrivers);

// api that returns list of truck drivers approved
router.get("/driver/approved", isAdmin, adminController.getVerifiedDrivers);

// api that returns list of truck drivers declined










module.exports = router;