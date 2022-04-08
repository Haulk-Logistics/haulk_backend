const mongoose = require('mongoose');
const {Schema} = mongoose;


const adminSchema = new Schema({});


const Admin = mongoose.model('Admin', adminSchema);


module.exports = Admin;