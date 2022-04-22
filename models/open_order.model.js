const { Schema, model } = require('mongoose');
const openOrdersSchema = new Schema ({
    openOrder: {
        type: Schema.Types.ObjectId,
        ref: 'order',
        required: [true, 'open order is required']
    }
});

module.exports = model('openOrder', openOrdersSchema);
