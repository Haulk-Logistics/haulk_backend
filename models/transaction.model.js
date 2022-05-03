// Transaction Model

const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const haulk_uid = require('../utils/unique_id_gen');


const transactionSchema = new Schema({
    userDetails:{
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    // TRANSACTION ID
    transaction_id: {
        type: String,
        // default: haulk_uid.v2(),
        // unique: true
    },
    //TRANSACTION TYPE
    transactionType: {
        type: String,
        required: true,
        enum: ["deposit", "withdrawal"],
    },

    //TRANSACTION AMOUNT
    transactionAmount: {
        type: Number,
        required: true,
        min: [0, 'Transaction amount must be greater than 0'],
    },

    //TRANSACTION DATE
    transactionDate: {
        type: Date,
        default: Date.now,
    },

    //TRANSACTION STATUS
    transactionStatus: {
        type: String,
        required: true,
        enum: ["pending", "completed"],
    },

    //TRANSACTION DESCRIPTION
    transactionDescription: {
        type: String,
        required: true,
        minlength: [4, 'Transaction description must be at least 6 characters long'],
    },

    //TRANSACTION REFERENCE
    transactionReference: {
        type: String,
        // unique: true,
        default: haulk_uid.v2(),
    },

});


const Transaction = mongoose.model('Transaction', transactionSchema);


module.exports = Transaction;