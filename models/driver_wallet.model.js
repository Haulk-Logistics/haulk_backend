const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const WalletSchema = new Schema({
    currentBalance: {
        type: Number,
        default: 0
    },
    withdrawableBalance: {
        type: Number,
        default: 0
    },
});


const Wallet = mongoose.model('Wallet', WalletSchema);
module.exports = Wallet;