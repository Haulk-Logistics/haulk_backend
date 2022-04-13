const {
  Schema,
  model
} = require("mongoose");

const truckSchema = new Schema({
  truck_driver: {
    type: Schema.Types.ObjectId,
    ref: 'TruckDriver',
    required: [true, 'truck driver is required']
  },
  truck_type: {
    type: String,
    required: [true, 'truck type is required'],
  },
  truck_size: {
    type: String,
    required: [true, 'truck size is required'],
  },
  licence_plate_number_image: {
    type: String,
    required: [true, 'licence plate number image is required'],
  },
  driver_license_image: {
    type: String,
    required: [true, 'driver license image is required']
  },
  vehicle_license_image: {
    type: String,
    required: [true, 'vehicle licence image is required'],
  },
  certificate_of_insurance_image:{
    type: String,
    required: [true, 'certificate of insurance image is required'],
  },

  certificate_of_road_worthiness_image: {
    type: String,
    required: [true, 'certificate of road worthiness image is required']
  },

  transist_goods_license_image: {
    type: String,
    required: [true, 'transit goods license image is required']
  },

  port_passes_image: {
    type: String,
    required: [true, 'port passes image is required']
  },

  truck_image: {
    type: String,
    required: [true, 'truck image is required']
  },

  driver_image: {
    type: String,
    required: [true, 'driver image is required']
  },

  created_at: {
    type: Date,
    default: Date.now()
  }

});

const Truck = model("Truck", truckSchema);
module.exports = Truck;