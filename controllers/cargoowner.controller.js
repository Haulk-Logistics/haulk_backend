const cargoOwnwer = {};
const Order = require("../models/order.model");
const Cargoowner = require("../models/cargo_owner.model");

cargoOwnwer.getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      ordered_by: req.user._id,
      order_status: "dropped_off",
    });
    if (orders && orders.length > 0) {
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: orders,
      });
    } else if (orders && orders.length === 0) {
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: "You do not have any order history",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      statuscode: 200,
      status: "error",
      message: "Error retrieving your order history",
    });
  }
};

cargoOwnwer.getActiveOrder = async (req, res) => {
  
  try {
    const orders = await Order.find({
      ordered_by: req.user._id,
      order_status: { $ne: "dropped_off" },
    });
    if (orders && orders.length > 0) {
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: orders,
      });
    } else if (orders && orders.length === 0) {
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: "You do not have any active order",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      statuscode: 200,
      status: "error",
      message: "Error retrieving your active orders",
    });
  }
};

cargoOwnwer.getProfile = async (req, res) => {
  try {
    const user = await Cargoowner.find({
      userDetails: req.user._id,
    }).populate("userDetails");
    if (user) {
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      statuscode: 200,
      status: "error",
      message: "Error retrieving your user details",
    });
  }
};

module.exports = cargoOwnwer;
