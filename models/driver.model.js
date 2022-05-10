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
  walletDetails: {
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


accepted: {
    // type: Boolean,
    // index: true,
    // default: false
    lowercase: true,
    type: String,
    enum: ['verified','unverified','rejected'],
    default: 'unverified'
},



});

const TruckDriver = mongoose.model("TruckDriver", truckDriverSchema);

module.exports = TruckDriver;
