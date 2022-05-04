const { Schema, model } = require("mongoose");
const orderSchema = new Schema({
  ordered_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'user id is required']
  },
  transaction_id: {
    type: String
  },
  transaction_ref: {
    type: String,
    // default: 'paypending',
    // ref: "transactions",
    // required: [true, 'transaction Id is required']
  },
  truck_driver:{
    type: Schema.Types.ObjectId,
    ref: "TruckDriver",
    default: null,
  },
  nature_of_goods: {
    type: String,
    required: [true, 'nature of good is required'],
  },
  truck_type: {
    type: String,
    require: [true, 'truck type is required'],
  },
  drop_off_location: {
    type: String,
    required: [true, 'drop off location is required'],
  },
  pick_off_location: {
    type: String,
    required: [true, 'pick off location is required'],
  },
  pick_up_date: {
    type: String,
    required: [true, 'pick up date is required'],
  },
  container_size: {
    type: String,
    required: [true, 'container size is required'],
  },
  container_number: {
    type: String,
    required: [true, 'cointainer number is required'],
  },
  shipping_line: {
    type: String,
    required: [true, 'shipping line is required'],
  },
  proof_url: {
    type: String,
    required: [true, 'proof image is required'],
  },
  ordered_at: {
    type: Date,
    default: Date.now(),
  },
  delivered_at: {
    type: Date,
  },
  amount: {
    type: Number,
    default: 0,
    required: [true, 'Amount is required'],
  },
  order_status: {
    type: String,
    lowercase: true,
    required: [true, 'order status is required'],
    enum: ["processing","pending", "accepted", "picked_up", "in_transit", "dropped_off"],
    // default: "processing",
  },
});

module.exports = model("order", orderSchema);
