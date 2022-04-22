const DriverModel = require("../models/driver.model");

const releaseOrders = async (truckType, id) => {
  const savings = [];
  const drivers = await DriverModel.find().populate({
    path: "truckDetails",
    match: { truck_type: truckType },
  });
  for (let i = 0; i < drivers.length; i++) {
    drivers[i].orders.push(id);
    const saved = await drivers[i].save();
    savings.push(saved);
  }
  return savings;
};
module.exports = releaseOrders;
