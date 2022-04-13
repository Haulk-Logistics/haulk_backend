// Haulj Admin Model
const mongoose = require('mongoose');
const {
    Schema
} = mongoose;


const adminSchema = new Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },

    //EMAIL ADDRESS
    email: {
        type: String,
        unique: true,
        required: true,
        match: [/.+@.+\..+/, 'Please enter a valid e-mail address'],
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value);
            },
            message: 'Please enter a valid e-mail address',
        },
    },

    //PASSWORD
    password: {
        type: String,
        // select: false,
        required: true,
        min: 6
    }

});


const Admin = mongoose.model('Admin', adminSchema);


module.exports = Admin;