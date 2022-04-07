const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const cargoOwnerSchema = new Schema({
    userDetails: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});


const CargoOwner = mongoose.model('CargoOwner', cargoOwnerSchema);

module.exports = CargoOwner;