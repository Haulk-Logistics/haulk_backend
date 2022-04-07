const mongoose = require('mongoose');
const {Schema} = mongoose;


const activityLogSchema = new Schema({
    user: String,
    type: String,
    createdAt: { type: Date, default: Date.now() },
  });


const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;