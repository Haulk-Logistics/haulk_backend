const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const WalletSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    currentBalance: {
        type: Number,
        min: 0,
        default: 0
    },

    withdrawableBalance: {
        type: Number,
        min: 0,
        default: 0
    },


});


const Wallet = mongoose.model('Wallet', WalletSchema);
module.exports = Wallet;