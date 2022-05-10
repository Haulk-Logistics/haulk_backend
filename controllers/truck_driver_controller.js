// import models
const Driver = require("../models/driver.model");
const Wallet = require("../models/driver_wallet.model");
const Orders = require("../models/order.model");
const mail = require("../services/mail.services");

const driverController = {};

// route to see open orders
driverController.seeOpenOrders = async (req, res) => {

  try {
    const {
      _id
    } = req.user;
    const driverTruckDetails = await Driver.findOne({
      userDetails: _id,
    }).populate("truckDetails", "truck_type");

    console.log(driverTruckDetails);
    const {
      truck_type
    } =
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
      res.status(200).json({
        status: "success",
        statuscode: 200,
        message: [],
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
  const {
    id
  } = req.params;

  if (!id) {
    return res.status(400).send({
      statuscode: 400,
      status: "error",
      message: "No order id provided",
    });
  }

  try {

    await Orders.findById(id);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      status: "error",
      statuscode: 404,
      message: "Order Id Is Invalid",
    });
  }
  try {
    //   if user has an order don't accept another order
    const driver = await Driver.findOne({
      userDetails: req.user._id,
    }).populate("orders").populate("userDetails").populate("truckDetails");
    const hasOrder =
      driver &&
      driver.orders.findIndex((x) => x.order_status !== "dropped_off");
    if (hasOrder !== -1) {
      return res.status(200).json({
        status: "error",
        statuscode: 200,
        message: "you already have an unfinished order",
      });
    }
    const order = await Orders.findOne({
      _id: id,
    }).populate('ordered_by');
    if (!order) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        message: "order not found",
      });
    }

    //   checks if another driver has picked up the order
    if (order.order_status === "accepted") {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "order has been picked up by driver",
      });
    }
    //     updates the order status to active
    //     and adds the driver to the order
    order.order_status = "accepted";
    order.truck_driver_name = `${driver.userDetails.firstName} ${driver.userDetails.lastName}`;
    order.truck_driver_phone = driver.userDetails.phoneNumber;
    order.truck_driver_image = driver.truckDetails.driver_image;
    order.truck_driver_truck_number = driver.truckDetails.licence_plate_number;
    console.log(order.truck_driver_truck_number);

    //     saves updated order status
    const accepted_order = await order.save();
    //     find driver who want's to accept order and insert accepted order into the order array
    const updated_driver = await Driver.findOneAndUpdate({
      userDetails: req.user._id,
    }, {
      $push: {
        orders: accepted_order._id,
      },
    }, {
      new: true,
    }).populate('userDetails').populate('walletDetails');
    if (updated_driver) {
      // ninety percent of order amount
      const driverEarning = order.amount * 0.9;
      const fifty_percent_of_order_amount = driverEarning / 2;

      // Add 90 percent of Amount to driver wallet
      const updatedWallet = await Wallet.findOne({
        user: req.user._id,
      });
      if (updatedWallet) {
        console.log(updated_driver.walletDetails);
        // update wallet balances
        updatedWallet.currentBalance = await updatedWallet.currentBalance + fifty_percent_of_order_amount;
        updatedWallet.withdrawableBalance = await updatedWallet.withdrawableBalance + fifty_percent_of_order_amount;


        // save updated wallet balance
        await updatedWallet.save();



      }

      // send Email notification to the user
      const usersEmail = order.ordered_by.email;
      const driver_name = `${updated_driver.userDetails.firstName}`;
      const order_id = order._id;
      const usersName = order.ordered_by.firstName;
      await mail.sendOrderAcceptedByDriverEmail(usersEmail, driver_name, order_id, usersName);


      res.status(200).json({
        status: "success",
        statuscode: 200,
        message: "you have successfully accepted an order",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      statuscode: 500,
      message: "Internal Server Error",
    });
  }
};

// route to view driver profile
driverController.viewProfile = async (req, res) => {
  try {
    // retruns all orders
    const driverProfile = await Driver.findOne({
        userDetails: req.user._id,
      })
      .populate("userDetails")
      .populate("truckDetails")
      .populate("walletDetails");
    if (!driverProfile) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        message: "Driver With User Id Not Found",
      });
    }
    res.status(200).send({
      statuscode: 200,
      status: "success",
      message: driverProfile,
    });
  } catch (e) {
    res.status(500).send({
      statuscode: 500,
      status: "error",
      message: "Error retrieving driver's profile",
    });
  }
};

// route to view driver active orders
driverController.activeOrder = async (req, res) => {
  try {
    // retruns all orders
    const activeOrder = await Driver.findOne({
      userDetails: req.user._id,
    }).populate({
      path: "orders",
      match: {
        order_status: {
          $ne: "dropped_off",
        },
      },
    });
    console.log(activeOrder);
    if (activeOrder.orders.length === 0) {
      return res.status(200).send({
        statuscode: 200,
        status: "success",
        message: "No active order",
      });
    }
    let theActiveOrder = '';
    if (activeOrder.orders.length > 0) {
      theActiveOrder = await Orders.findById(activeOrder.orders[0]._id).populate('ordered_by');
      console.log(theActiveOrder);
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: theActiveOrder,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({
      statuscode: 500,
      status: "error",
      message: "Error retrieving order history",
    });
  }
};

// route to view order history
driverController.orderHistory = async (req, res) => {
  try {
    // retruns all orders
    const orderHistory = await Driver.findOne({
      userDetails: req.user._id,
    }).populate({
      path: "orders",
      match: {
        order_status: "dropped_off",
      },
    });
    // retruns orders where status != dropped_off

    let orders = await orderHistory.orders;

    if (orders.length === 0) {
      return res.status(200).send({
        statuscode: 200,
        status: "success",
        message: [],
      });
    }
    if (orders.length > 0) {
      res.status(200).send({
        statuscode: 200,
        status: "success",
        message: orders,
      });
    }
  } catch (e) {
    res.status(500).send({
      statuscode: 500,
      status: "error",
      message: "Error retrieving order history",
    });
  }
};

// updates order status
driverController.updateOrderStatus = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const driver_user_id = await req.user._id;

    const orderStatus = await req.body.status;
    if (!orderStatus) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Please provide order status",
      });
    }
    // Turns Order Status To LowerCase Chracters
    const orderStatusLower = orderStatus.toString().toLowerCase();
    const validOrderStatus = ["accepted", "picked_up", "dropped_off", "in_transit"];

    // Check if order with that id exists
    const order = await Orders.findOne({
      _id: id
    });

    // Confirm Order Is Valid
    if (!order) {
      return res.status(404).json({
        status: "error",
        statuscode: 404,
        message: "Order with that id not found"
      });
    }
    // Check If Valid Order Status contains the order status

    if (validOrderStatus.includes(orderStatusLower) === false) {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "Please provide a valid order status",
      });
    }

    // Check if order status is already accepted
    if (order.order_status === "dropped_off") {
      return res.status(400).json({
        status: "error",
        statuscode: 400,
        message: "You cant update a completed order",
      });
    }

    order.order_status = orderStatus;
    //  save order
    const updatedOrder = await order.save();
    if (updatedOrder) {
      if (updatedOrder.order_status === "dropped_off") {
        // 90 percent of the order amount
        // console.log(updatedOrder.amount);
        const orderAmount = parseInt(updatedOrder.amount);
        // console.log(orderAmount);



        const driverEarning = orderAmount * 0.9;
        // 50 percent of the driver earnings
        const fifty_percent_of_order_amount = driverEarning / 2;

        // update driver earnings
        const updated_wallet = await Wallet.findOne({
          user: driver_user_id,
        });

        if (updated_wallet) {
          //     update wallet balances
          updated_wallet.currentBalance = await updated_wallet.currentBalance - fifty_percent_of_order_amount;
          updated_wallet.withdrawableBalance = await updated_wallet.withdrawableBalance + fifty_percent_of_order_amount;

          // update total earnings
          updated_wallet.total_earnings = await updated_wallet.total_earnings + driverEarning;

          await updated_wallet.save();

          // return res.status(200).send({
          //   statuscode: 200,
          //   status: "success",
          //   message: "Order status updated successfully",
          // });
        }
      }

      return res.status(200).send({
        statuscode: 200,
        status: "success",
        message: "Order status updated successfully",
      });


    }



  } catch (error) {
    console.log(error)
    res.status(500).send({
      statuscode: 500,
      status: "error",
      message: "Error updating order status",
    });
  }
};

module.exports = driverController;