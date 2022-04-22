const express = require("express");
const { body } = require("express-validator");
const {
  get_quotation,
  make_order,
} = require("../../controllers/book_truck.controllers");

// Router
const router = express.Router();

// post to book a truck
router.post(
  "/get_quotation",
  body("latSrc").not().isEmpty().trim().escape(),
  body("longSrc").not().isEmpty().trim().escape(),
  body("latDes").not().isEmpty().trim().escape(),
  body("longDes").not().isEmpty().trim().escape(),
  get_quotation
);

//  booking a truck and make payment for the truck
router.post(
  "/book_a_truck",
  make_order
);

module.exports = router;