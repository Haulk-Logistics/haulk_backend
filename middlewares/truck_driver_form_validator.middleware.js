const {
    contextsKey
} = require('express-validator/src/base');
const User = require('../models/user.model');


module.exports.truckDriverFormValidator = (req, res, next) => {
    const truck_driver = req.body.truck_driver;
    const truckType = req.body.truck_type;
    const truckSize = req.body.truck_size;
    const licencePlateNumberImage = req.body.licence_plate_number_image;
    const driverLicenseImage = req.body.driver_license_image;
    const vehicleLicenseImage = req.body.vehicle_license_image;
    const certificateOfInsuranceImage = req.body.certificate_of_insurance_image;
    const certificateOfRoadWorthinessImage = req.body.certificate_of_road_worthiness_image;
    const transistGoodsLicenseImage = req.body.transist_goods_license_image;
    const portPassesImage = req.body.port_passes_image;
    const truckImage = req.body.truck_image;
    const driverImage = req.body.driver_image;

    
}