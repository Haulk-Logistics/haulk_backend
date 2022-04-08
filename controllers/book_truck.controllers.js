const { calculate_amount } = require("../utils/calculate_amount.util");
const book_truck_controller = {};
const { upload_image, upload } = require('../utils/cloudinary');
book_truck_controller.get_quotation = async (req,res) => {
    const data = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const amount = await calculate_amount(data.distance);
        data.amount = amount;
        res.status(200).json({
            'status': 'success',
            'statuscode': 200,
            'message': data
        });
    } catch (error) {
        res.status(500).json({
            'status': 'error',
            'statuscode': 500,
            'message': "can't retrun quotation"
        })
    }
}

book_truck_controller.make_order = async (req,res) => {
    const data = req.files;
    console.log(data)
    
}

module.exports = book_truck_controller;