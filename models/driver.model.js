const mongoose = require('mongoose');
const {Schema} = mongoose;

const truckDriverSchema = new Schema({
    userDetails: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    truck: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});



const TruckDriver = mongoose.model('Driver', truckDriverSchema);

module.exports = TruckDriver;