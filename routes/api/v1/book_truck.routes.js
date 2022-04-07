const express = require("express");
const { body } = require("express-validator");
const {
  get_quotation,
} = require("../../../controllers/book_truck.controllers");
const router = express.Router();

router.post(
  "/book_a_truck",
  body("nature_off_goods").not().isEmpty().trim().escape(),
  body("truck_type").not().isEmpty().trim().escape(),
  body("drop_off_location").not().isEmpty().trim().escape(),
  body("pick_off_location").not().isEmpty().trim().escape(),
  body("pick_up_date").not().isEmpty().trim().escape(),
  body("container_size").not().isEmpty().trim().escape(),
  body("container_number").not().isEmpty().trim().escape(),
  body("shipping_line").not().isEmpty().trim().escape(),
  body("proof_url").not().isEmpty().trim().escape(),
  get_quotation
);

module.exports = router;
