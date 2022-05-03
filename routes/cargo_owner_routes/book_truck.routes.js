const express = require("express");
const { body } = require("express-validator");
const bookATruck= require("../../controllers/book_a_truck.controller");
const { isAuthorized, isCargoOwner } = require("../../middlewares/auth.middlewares");
// Router
const router = express.Router();

// post to book a truck
router.post(
  "/get_quotation",
  body("latSrc").not().isEmpty().trim().escape(),
  body("longSrc").not().isEmpty().trim().escape(),
  body("latDes").not().isEmpty().trim().escape(),
  body("longDes").not().isEmpty().trim().escape(),
  bookATruck.get_quotation
);

//  booking a truck and make payment for the truck

// Initialize Paystack Payment
router.post("/book_a_truck/initialize_payment", isAuthorized, isCargoOwner,bookATruck.initialize_payment );

router.post("/book_a_truck/verify_payment", isAuthorized, isCargoOwner,bookATruck.verify_payment);
module.exports = router;
