// import models
const Driver = require("../models/driver.model");
const Orders = require("../models/order.model");

const driverController = {};

// route to see open orders
driverController.seeOpenOrders = async (req, res) => {
  const { _id } = req.user;
  try {
    const driverTruckDetails = await Driver.findOne({
      userDetails: _id,
    }).populate("truckDetails", "truck_type");
    const { truck_type } =
      driverTruckDetails && driverTruckDetails.truckDetails;
    const orders = await Orders.find({
      truck_type: truck_type,
      order_status: "pending",
    });
    if (orders.length > 0) {
      res.status(200).json({
        status: "success",
        statuscode: 200,
        message: orders,
      });
    } else {
      res.status(500).json({
        status: "error",
        statuscode: 500,
        message: "There is no order open for you",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      message: "Error retrieving Open orders",
    });
  }
};

// route to accept orders
driverController.acceptOrder = async (req, res) => {
  const { id } = req.params;
  // returns id which this pariticular order id
  try {
    //   if user has an order don't accept another order
    const driver = await Driver.findOne({ userDetails: req.user._id });
    if (driver && driver.orders.length > 0) {
      return res.status(500).json({
        status: "error",
        statuscode: 500,
        message: "you already have an unfinished order",
      });
    }
    const order = await Orders.findOne({ _id: id });
    //   checks if another driver has picked up the order
    if (order.order_status === "accepted") {
      return res.status(500).json({
        status: "error",
        statuscode: 500,
        message: "order has been picked up by driver",
      });
    }
    //     updates the order status to active
    order.order_status = "accepted";
    //     saves updated order status
    const accepted_order = await order.save();
    //     find driver who want's to accept order and insert accepted order into the order array
    const updated_driver = await Driver.findOneAndUpdate(
      { userDetails: req.user._id },
      { $push: { orders: accepted_order._id } },
      { new: true }
    );
    if (updated_driver) {
      res.status(200).json({
        status: "success",
        statuscode: 200,
        message: "you have successfully booked your order",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      statuscode: 500,
      message: "you have issues accepting your order",
    });
  }
};


// route to view driver active orders
driverController.activeOrder = async (req, res) => {
  try {
    // retruns all orders
    const activeOrder = await Driver.find({
      userDetails: req.user._id,
    }).populate({
      path: "orders",
      match: { order_status: { $ne: "dropped_off" } },
    });
    // retruns orders where status != dropped_off
    res.status(200).send({
      statuscode: 200,
      status: "success",
      message: activeOrder,
    });
  } catch (e) {
    res.status(500).send({
      statuscode: 500,
      status: "error",
      message: "Error returning active order",
    });
  }
};

// route to view order history
driverController.orderHistory = async (req, res) => {
  try {
    // retruns all orders
    const orderHistory = await Driver.find({
      userDetails: req.user._id,
    }).populate({
      path: "orders",
      match: { order_status: "dropped_off" },
    });
    // retruns orders where status != dropped_off
    res.status(200).send({
      statuscode: 200,
      status: "success",
      message: orderHistory,
    });
  } catch (e) {
    res.status(500).send({
      statuscode: 500,
      status: "error",
      message: "Error retrieving order history",
    });
  }
};

module.exports = driverController;
