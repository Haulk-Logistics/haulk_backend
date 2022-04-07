const mongoose = require('mongoose');
const {Schema} = mongoose;

const truckDriverSchema = new Schema({
    userDetails: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    // wallet: {
        
    //   },


    // documentation: {
    //     TIN: { type: String, default: "" },
    //     homeAddress: { type: String, default: "" },
    //     officeAddress: { type: String, default: "" },
    //     BVN: { type: String, default: "" },
    //     NIN: { type: String, default: "" },
    //     IDCard: { type: String, default: "" },
    //     CAC: { type: String, default: "" },
    //     utilityBill: { type: String, default: "" },
    //   },
});



const TruckDriver = mongoose.model('Driver', truckDriverSchema);

module.exports = TruckDriver;