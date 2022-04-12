const { Schema, model } = require("mongoose");
const orderSchema = new Schema({
  ordered_by: {
    type: Schema.Types.ObjectId,
    ref: "cargoowner",
    required: [true, 'user id is required']
  },
  transaction_id: {
    type: Schema.Types.ObjectId,
    ref: "transactions",
    required: [true, 'transaction Id is required']
  },
  nature_of_goods: {
    type: String,
    required: [true, 'natrue of good is required'],
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
    required: [true, 'delivery date is required'],
  },
  amount: {
    type: Number,
    require: [true, 'Amount is required'],
  },
  order_status: {
    type: String,
    required: [true, 'order status is required'],
    enum: ["pending", "delivered", "in_complete"],
    default: "pending",
  },
});

module.exports = model("order", orderSchema);
