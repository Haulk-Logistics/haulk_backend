var path = require('path');
require("dotenv").config({
    path: path.join(__dirname, `/configs/${process.env.APP_ENV?.trim()}.env`),
});


const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");



const app = express();
const PORT = process.env.PORT || 6000;
const databaseUrl = process.env.MONGOURL;







// Middlewares
app.use(express.json());
app.use(cors());



// Connect To Database
const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(databaseUrl,connectionParams)
    .then( () => {
        console.log(`Successfully Connected to Haulk-Mongo ${process.env.APP_ENV} Database `)
    })
    .catch( (err) => {
        console.error(`Error connecting to Haulk-Mongo ${process.env.APP_ENV} database. ${err}`);
    })


// ROUTES
// Defualt Route
app.get("/", async function (req, res, next) {
    res.status(200).json({
        'status': 'success',
        'statusCode': 200,
        'message': 'Welcome to the Haulk Logistics API'
    });
});



// handle undefined Routes
app.use('*', (req, res, next) => {
    res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Route not found'
    });
});



// START SERVER
app.listen(process.env.PORT || PORT, () => {
    console.log(`Haulk ${process.env.APP_ENV} Server started on port ${PORT}`);
});