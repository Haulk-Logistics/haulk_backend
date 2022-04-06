const mongoose = require('mongoose');
const {
    Schema
} = mongoose;

const userSchema = new Schema({
    //FIRST NAME
    firstName: {
        type: String,
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [30, 'First name must be less than 30 characters'],
        required: true,
    },

    //LAST NAME
    lastName: {
        type: String,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [30, 'Last name must be less than 30 characters'],
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

    // PHONE NUMBER
    phoneNumber: {
        type: String,
        required: true,
        minlength: [11, 'Phone number must be at least 10 characters long'],
        maxlength: [11, 'Phone number must be less than 11 characters'],
    },

    //PASSWORD
    password: {
        type: String,
        select: false,
        require: true,
        min: 6
    },

    //USER ROLE
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },

    //STATUS
    accountStatus: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    }


});

const User = mongoose.model('Users', userSchema);

// Export MOdel
module.exports = User;