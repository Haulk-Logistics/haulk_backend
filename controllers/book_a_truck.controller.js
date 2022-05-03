const {
  validationResult
} = require("express-validator");

// Modules
const formidable = require("formidable");
const request = require('request');
const _ = require("lodash");
const {
  calculate_amount
} = require("../utils/calculate_amount.util");

//Models
const OrderModel = require("../models/order.model");
const TransactionModel = require("../models/transaction.model");
const truckModel = require("../models/truck.model");


// Services
const {
  upload_image
} = require("../services/cloudinary.services");
const getDistanceFromLatLonInKm = require("../utils/calculate_distance");
const paystack = require("../services/paystack.services");
// const { response } = require("express");
const book_truck_controller = {};

// Get Qoutation for a truck
book_truck_controller.get_quotation = async (req, res) => {
  try {
    const data = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

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

// Create an Order still being processed And Initialize Paystack Payment
book_truck_controller.initialize_payment = async (req, res) => {
  try {
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
      const user = await req.user;

      if (!user) {
        return res.status(401).json({
          status: "error",
          statuscode: 401,
          message: "Unauthenticated request",
        });
      }

      if (!files.cargoImage) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          message: "cargo image is required",
        });
      }

      // Confirm Nature Of Goods
      if (!fields.natureOfGoods) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          message: "Nature of goods required",
        });
      }

      // Confirm Truck Type
      if (!fields.truckType) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          message: "Truck type required",
        });
      }

      // Confirm Dropoff Location
      if (!fields.dropOffLocation) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          message: "Dropoff location required",
        });
      }

      // Confirm PickOff Location
      if (!fields.pickUpLocation) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          message: "Pickup location required",
        });
      }

      // Confirm Pickup Date
      if (!fields.pickUpDate) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          message: "Pickup date required",
        });
      }

      // Confirm Container Size
      if (!fields.containerSize) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          message: "Container size required",
        });
      }

      // Confirm Container Number
      if (!fields.containerNumber) {
        return res.status(400).json({
          status: "error",
          statuscode: 400,
          message: "Container number required",
        });
      }

      // Confirm Shippping Line
      if (!fields.shippingLine) {
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


      let image_url;
      const file_path = await files.cargoImage.filepath;

      if (file_path) {
        const result = await upload_image(file_path, "Driver");
        image_url = result && result.url;
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
        pickUpLocation,
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

      const form = _.pick(payment_data, ['amount', 'email', 'full_name']);
      form.metadata = {
        full_name: form.full_name
      }

      form.amount *= 100;

      // Initialize Payment
      paystack.initializePayment(form, async (error, body) => {
        if (error) {
          //handle errors
          console.log(error);
          return res.status(500).json({
            status: "error",
            statuscode: 500,
            message: "Server couldn't process payment. Please try again if error persists , please contact 'support@haulk.com' ",
          });
        }
        const response = JSON.parse(body);

        console.log(response);

        // Create Transaction Object
        const transaction = await new TransactionModel({
          userDetails: user._id,
          transactionType: "deposit",
          transactionAmount: amount,
          transactionStatus: "pending",
          transactionDescription: "Payment for Order",
          transactionReference: response.data.reference || "",
        });

        // Save Transaction to Database
        const savedTransaction = await transaction.save();

        // Create Order Object
        const newOrder = await new OrderModel({
          ordered_by: user._id,
          amount: savedTransaction.amount,
          transaction_id: savedTransaction._id,
          order_status: "processing",
          nature_of_goods: natureOfGoods,
          truck_type: truckType,
          drop_off_location: dropOffLocation,
          pick_off_location: pickUpLocation,
          pick_up_date: pickUpDate,
          container_number: containerNumber,
          container_size: containerSize,
          shipping_line: shippingLine,
          proof_url: image_url,
        });

        // save order to database
        await newOrder.save();
        res.status(200).json({
          authorization_url: response.data.authorization_url,
        });
        // Redirect to Paystack Payment Page
        // res.redirect(response.data.authorization_url);




      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      statuscode: 500,
      message: "Server couldn't process payment. Please try again if error persists , please contact ",
    });
  }
};

// Verify Paystack Payment, Update Order Status and Transaction Status
book_truck_controller.verify_payment = async (req, res) => {
  try {
    const {
      reference
    } = req.body;

    // console.log(reference);

    if (!reference) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Payment reference is required, Add it to your request body",
      });
    }

    paystack.verifyPayment(reference, async (error, body) => {
      if (error) {
        //handle errors
        console.log(error);
        return res.status(500).json({
          status: "error",
          statuscode: 500,
          message: "Server couldn't process payment. Please try again if error persists , please contact ",
        });
      }
      const response = JSON.parse(body);
      if (!response) {
        return res.status(500).json({
          status: "error",
          statuscode: 500,
          message: "Server couldn't process payment. Please try again if error persists , please contact 'support@haulk.com' ",
        });
      }

      // console.log(response);
      if (response.data.status === "success") {
        // Update Transaction Status
        const transaction = await TransactionModel.findOne({
          transactionReference: reference
        });

        if (!transaction) {
          return res.status(400).json({
            status: "error",
            statuscode: 400,
            message: "Transaction not found",
          });
        }


        console.log(transaction);
        transaction.transactionStatus = "completed";
        // transaction.transactionReference = response.data.reference;
        transaction.markModified('transactionStatus');
        const savedTransaction = await transaction.save();

        // Update Order Status
        const filter = {
          transaction_id: savedTransaction._id
        };
        const update = {
          transaction_ref: savedTransaction.transactionReference,
          order_status: "pending"
        };
        const order = await OrderModel.findOne({
          transaction_id: savedTransaction._id
        });
        order.transaction_ref = await savedTransaction.transactionReference;
        order.order_status = "pending";
        await order.markModified("transaction_ref");
        await order.markModified("order_status");
        const savedOrder = await order.save();
        // const savedOrder = await OrderModel.updateOne(filter, update, {new: true});
        console.log(savedOrder);

        res.status(200).json({
          status: "paysuccess",
          statuscode: 200,
          message: "Payment Successful",
          data: {
            orderStatus: savedOrder.order_status,
            transactionStatus: savedTransaction.transactionStatus,
            natureOfGoods: savedOrder.nature_of_goods,
            truckType: savedOrder.truck_type,
            dropOffLocation: savedOrder.drop_off_location,
            pickUpLocation: savedOrder.pick_off_location,
            pickUpDate: savedOrder.pick_up_date,
            containerNumber: savedOrder.container_number,
            shippingLine: savedOrder.shipping_line,
            // orderId: savedOrder._id,
            transactionAmount: savedTransaction.transactionAmount,
            // transaction_details: savedTransaction,
            // order_details: savedOrder,
          },
        });
        // res.redirect('/');
      } else if (response.data.status === "failed") {
        // confirm reference number exist
        const verifyRefNo = await TransactionModel.findOne({
          transactionReference: reference
        });
        if (!verifyRefNo) {
          return res.status(400).json({
            status: "error",
            statuscode: 400,
            message: "Payment reference not found",
          });
        }

        // Update Transaction Status
        const transaction = await TransactionModel.findOneAndDelete({
          transactionReference: reference
        });
        // transaction.transactionStatus = "completed";
        // transaction.transactionReference = response.data.reference;

        // Update Order Status
        const order = await OrderModel.findOneAndDelete({
          transaction_id: transaction._id
        });
        // order.order_status = "pending";

        await order.save();
        await transaction.save();

        res.status(400).json({
          status: "payfailed",
          statuscode: 400,
          message: "Payment Failed, Please try again, if error persists or you were debited, please contact your ATM card issuer",
        });
      } else {
        res.status(400).json({
          status: "payfailed",
          statuscode: 400,
          message: "Payment Failed, Please try again, if error persists or you were debited, please contact your ATM card issuer",
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      statuscode: 500,
      message: "Server couldn't process payment. Please try again if error persists , please contact admin ",
    });
  }
};




module.exports = book_truck_controller;