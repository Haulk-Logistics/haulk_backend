const mongoose = require("mongoose");
const { Schema } = mongoose;

const truckDriverSchema = new Schema({
  userDetails: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  truckDetails: {
    type: Schema.Types.ObjectId,
    ref: "Truck",
  },
  wallet: {
    type: Schema.Types.ObjectId,
    ref:'Wallet'
  },
  // admin_verified: {
  //   type: Boolean,
  //   default: false
  // },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "order",
    },
  ],
});

const TruckDriver = mongoose.model("TruckDriver", truckDriverSchema);

module.exports = TruckDriver;
