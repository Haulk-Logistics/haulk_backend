const { Schema, model } = require("mongoose");

const truckSchema = new Schema({
  truck_driver: {
    type: Schema.Types.ObjectId,
    ref:'drivers',
    required: [true, 'truck driver is required']
  },
  truck_info: {
    type: String,
    required: [true, 'truck type is required'],
  },
  truck_size: {
    type: String,
    required: [true, 'truck size is required'],
  },
  licence_plate_number: {
    type: String,
    required: [true, 'licence plate number']
  },
  vehicle_license_url: {
      type: String,
      required: [true, 'vehicle licence is required'],
  },
  certificate_road: {
      type: String,
      required: [true, 'road certificate is required']
  },
  driver_license: {
      type: String,
      required: [true, 'driver license is required']
  },
  transist_goods_license: {
    type: String,
    required: [true, 'transit goods license is required']
},
port_psses: {
    type: String,
    required: [true, 'port passes is required']
},

truck_image: {
    type: String,
    required: [true, 'truck image is required']
},
driver_image: {
    type: String,
    required: [true, 'driver image is required']
},
registered_at:{
    type: Date,
    required: [true.valueOf, 'Create date is required'],
    default: Date.now()
}
});

module.exports = model("Truck", truckSchema);
