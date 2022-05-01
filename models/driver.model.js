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
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "order",
    },
  ],


accepted: {
    type: Boolean,
    // index: true,
    default: false
},



});

const TruckDriver = mongoose.model("TruckDriver", truckDriverSchema);

module.exports = TruckDriver;
