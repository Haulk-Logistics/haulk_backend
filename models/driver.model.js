const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const truckDriverSchema = new Schema({
    userDetails: {
        type: Schema.Types.ObjectId,
        ref: 'User',

    },
    truckDetails: {
        type: Schema.Types.ObjectId,
        ref: 'Truck'
    },
});



const TruckDriver = mongoose.model('TruckDriver', truckDriverSchema);

module.exports = TruckDriver;