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
router.put("/driver/reject_driver/:driver_id", isAdmin, adminController.rejectTruckDriver);

// api that returns a driver using driver_id
router.get("/driver/:driver_id", isAdmin, adminController.getDriverById);

// View Haulk Total Cargo Owners Accounts
router.get("/cargoowner/total_cargo_owners", isAdmin, adminController.getTotalCargoOwners);

// View Haulk Total Completed Orders
router.get("/order/haulk_completed_orders", isAdmin, adminController.getTotalCompletedOrders);

// api that returns total driver (Approved, Declined, Awaiting Approval, total drivers)
router.get("/driver/total_drivers", isAdmin, adminController.getTotalDrivers);

// api that returns list of truck drivers awaiting approval
router.get("/driver/awaiting_verification", isAdmin, adminController.getUnverifiedDrivers);

// api that returns list of truck drivers approved
router.get("/driver/verified_drivers", isAdmin, adminController.getVerifiedDrivers);

// api that returns list of truck drivers rejected
router.get("/driver/rejected_drivers", isAdmin, adminController.getRejectedDrivers);

// api that returns haulk revenue
// router.get("/haulk_revenue", isAdmin, adminController.getHaulkRevenue);







module.exports = router;