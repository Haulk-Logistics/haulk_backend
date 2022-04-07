const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const driverWalletSchema = new Schema({
    driverBalance: {
        type: Number,
        default: 0
    },
    withdrawableDriverBalance: {
        type: Number,
        default: 0
    },
});


const DriverWallet = mongoose.model('DriverWallet', driverWalletSchema);
module.exports = DriverWallet;