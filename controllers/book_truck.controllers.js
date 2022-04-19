const { validationResult } = require("express-validator");
const formidable = require("formidable");
const truckModel = require('../models/truck.model');
const { calculate_amount } = require("../utils/calculate_amount.util");
const book_truck_controller = {};
const axios = require("axios");
const { upload_image } = require("../services/cloudinary.services");
const getDistanceFromLatLonInKm = require("../utils/calculate_distance");
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
      nature_of_goods,
      truck_type,
      drop_off_location,
      pick_off_location,
      pick_up_date,
      container_size,
      container_number,
      shipping_line,
    } = fields;
    const data = {
      ordered_by: req.user._id,
      nature_of_goods,
      truck_type,
      drop_off_location,
      pick_off_location,
      pick_up_date,
      container_number,
      container_size,
      shipping_line,
      url,
    };
    console.log(data);
  });
};

book_truck_controller.getDriver = async (req, res) => {
  const trucks =  await truckModel.find();
  console.log(trucks)
};

module.exports = book_truck_controller;
