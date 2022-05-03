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

cargoOwnwer.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      ordered_by: req.user._id,
    });

    if (orders && orders.length > 0) {
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: 'All Orders',
        all_orders: orders,
      });
    } else if (orders && orders.length === 0) {
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: "You do not have any order",
        all_orders: [],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      statuscode: 400,
      status: "error",
      message: "Error retrieving your orders",
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

cargoOwnwer.getEachOrder = async (req, res) => {
  const { id } = req.params
  console.log(id);
  try {
    const order = await Order.findOne({
      // ordered_by: req.user._id,
      _id: id
    }).populate("truck_driver");
    console.log(order);
    
    if (order) {
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: order,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      statuscode: 200,
      status: "error",
      message: "Error retrieving your  order",
    });
  }
}

module.exports = cargoOwnwer;
