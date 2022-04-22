var path = require("path");
require("dotenv").config({
  path: path.join(__dirname, `/configs/${process.env.APP_ENV?.trim()}.env`),
});

// Modules
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");

const app = express();
const PORT = process.env.PORT || 6000;
const databaseUrl = process.env.MONGOURL;

// routes
const auth = require('./routes/auth.routes');
const admin = require('./routes/admin_owner_routes/admin.routes');
const bookAtruck = require("./routes/cargo_owner_routes/book_truck.routes");


// Middlewares
app.use(express.json());
app.use(express.urlencoded({limit:'50mb' ,extended: false}))
app.use(cors());

// this would setup cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect To Database
const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.connect(databaseUrl, connectionParams)
    .then(() => {
        console.log(`Successfully Connected to Haulk-Mongo ${process.env.APP_ENV} Database `)
    })
    .catch((err) => {
        console.error(`Error connecting to Haulk-Mongo ${process.env.APP_ENV} database. ${err}`);
    })


// ROUTES
// Defualt Route
app.get("/", async function (req, res, next) {
  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: `Welcome to the Haulk ${process.env.APP_ENV} Logistics API`,
  });
});

// Haulk Admin Route
app.use('/admin', admin);

// SignUp, SignIn, Reset Password, VerifyEmail - Auth Route
app.use("/api/auth", auth);

// Booking Truck route
app.use("/api/", bookAtruck);

// handle undefined Routes
app.use("*", (req, res, next) => {
  res.status(404).json({
    status: "error",
    statusCode: 404,
    message: "Route not found",
  });
});

// START SERVER
app.listen(process.env.PORT || PORT, () => {
  console.log(`Haulk ${process.env.APP_ENV} Server started on port ${PORT}`);
});
