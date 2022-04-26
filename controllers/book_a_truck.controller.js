const {
  validationResult
} = require("express-validator");
const formidable = require("formidable");
const truckModel = require("../models/truck.model");
const {
  calculate_amount
} = require("../utils/calculate_amount.util");
const OrderModel = require("../models/order.model");
const {
  upload_image
} = require("../services/cloudinary.services");
const getDistanceFromLatLonInKm = require("../utils/calculate_distance");
const TransactionModel = require("../models/transaction.model");
const book_truck_controller = {};

// Get Qoutation for a truck
book_truck_controller.get_quotation = async (req, res) => {
  const data = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
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
      message: "can't return quotation",
    });
  }
};

// Make Order
book_truck_controller.make_order = async (req, res) => {
  const form = await new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        status: "error",
        statuscode: 500,
        message: "can't process order",
      });
    }
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: "error",
        statuscode: 401,
        message: "Unauthenticated request",
      });
    }

    if (!files.cargo_image) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "cargo image is required",
      });
    }

    // Confirm Nature Of Goods
    if (!fields.nature_of_goods) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Nature of goods required",
      });
    }

    // Confirm Truck Type
    if (!fields.truck_type) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Truck type required",
      });
    }

    // Confirm Dropoff Location
    if (!fields.dropoff_location) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Dropoff location required",
      });
    }

    // Confirm PickOff Location
    if (!fields.pickup_location) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Pickup location required",
      });
    }

    // Confirm Pickup Date
    if (!fields.pickup_date) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Pickup date required",
      });
    }

    // Confirm Container Size
    if (!fields.container_size) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Container size required",
      });
    }

    // Confirm Container Number
    if (!fields.container_number) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Container number required",
      });
    }

    // Confirm Shippping Line
    if (!fields.shipping_line) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Shipping line required",
      });
    }

    if (!fields.amount) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Order Amount required",
      });
    }


    let url;
    const file_path = await files.cargo_image.filepath;

    if (file_path) {
      const result = await upload_image(file_path, "Driver");
      url = result && result.url;
    } else {
      res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "No Image Uploaded",
      });
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
      amount
    } = fields;



    // process payment with paystack
    const customer_name = `${user.first_name} + ${user.last_name}`;
    const payment_data = {
      full_name: customer_name,
      amount: amount,
      email: user.email,
      phone: user.phone,
    };



    // const payment_response = await paystack.transaction.initialize(payment_data);
    // console.log(payment_response);

    // Create Transaction Object
    // const transaction = new TransactionModel({
    //   userDetails: user._id,
    //   transactionType: "deposit",
    //   transactionAmount: amount,
    //   transactionStatus: "pending",
    //   transactionDescription: "Payment for Order",
    //   transactionReference: "",
    // });


    // Create Order Object
    const newOrder = new OrderModel({
      ordered_by: user._id,
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
        message: "Your order has been made available to the drivers, wait shortly for a driver response",
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