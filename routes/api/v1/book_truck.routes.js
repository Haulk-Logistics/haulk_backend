const express = require("express");
const { body } = require("express-validator");
const {
  get_quotation,
  make_order,
} = require("../../../controllers/book_truck.controllers");
const { isAuthorized } = require("../../../middlewares/auth.middlewares");
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
  isAuthorized,
  body("nature_of_good").not().isEmpty().trim().escape(),
  // body("truck_type").not().isEmpty().trim().escape(),
  // body("drop_off_location").not().isEmpty().trim().escape(),
  // body("pick_off_location").not().isEmpty().trim().escape(),
  // body("pick_up_date").not().isEmpty().trim().escape(),
  // body("container_size").not().isEmpty().trim().escape(),
  // body("container_number").not().isEmpty().trim().escape(),
  // body("shipping_line").not().isEmpty().trim().escape(),
  body("image").not().isEmpty().trim().escape(),
  make_order
);

module.exports = router;
