const { validationResult } = require("express-validator");
const formidable = require("formidable");
const truckModel = require("../models/truck.model");
const { calculate_amount } = require("../utils/calculate_amount.util");
const OrderModel = require("../models/order.model");
const { upload_image } = require("../services/cloudinary.services");
const getDistanceFromLatLonInKm = require("../utils/calculate_distance");
const book_truck_controller = {};

// Get Qoutation for a truck
book_truck_controller.get_quotation = async (req, res) => {
  const data = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const distance = await getDistanceFromLatLonInKm(
      data.latSrc,
      data.longSrc,
      data.latDes,
      data.longDes
    );
    console.log(distance);
    const amount = await calculate_amount(distance);
    res.status(200).json({
      status: "success",
      statuscode: 200,
      message: amount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      message: "can't retrun quotation",
    });
  }
};

// Make Order
book_truck_controller.make_order = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    // upload to cloudinary
    let url;
    const file_path = files.image.filepath;
    if (file_path) {
      const result = await upload_image(file_path, "Driver");
      url = result && result.url;
    } else {
      console.log("No path inputed");
    }
    const {
      natureOfGoods,
      truckType,
      dropOffLocation,
      pickOffLocation,
      pickUpDate,
      containerSize,
      containerNumber,
      shippingLine,
    } = fields;

    // Create Order Object
    const newOrder = new OrderModel({
      ordered_by: req.user._id,
      nature_of_goods: natureOfGoods,
      truck_type: truckType,
      drop_off_location: dropOffLocation,
      pick_off_location: pickOffLocation,
      pick_up_date: pickUpDate,
      container_number: containerNumber,
      container_size: containerSize,
      shipping_line: shippingLine,
      proof_url: url,
    });
    // save order to database
    const savedOrder = await newOrder.save();
    if (savedOrder) {
      res.status(200).json({
        status: "success",
        statuscode: 200,
        message:
          "Your order has been made available to the drivers, wait shortly for a driver response",
      });
    } else {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        message: "can't make open Order",
      });
    }
  });
};

// retruns cargoowner order history


module.exports = book_truck_controller;
