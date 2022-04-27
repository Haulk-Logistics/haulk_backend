// import the request module
const request = require('request');
const MySecretKey = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;


const paystack = {};

// Initialize Paystack  Payment
paystack.initializePayment = (form, mycallback) => {
    const options = {
        url: 'https://api.paystack.co/transaction/initialize',
        headers: {
            authorization: MySecretKey,
            'content-type': 'application/json',
            'cache-control': 'no-cache'
        },
        form
    };

    const callback = (error, response, body) => {
        return mycallback(error, body);
    }
    request.post(options, callback);

};



// Verify Paystack Payment
paystack.verifyPayment = (ref, mycallback) => {
    const options = {
        url : 'https://api.paystack.co/transaction/verify/'+encodeURIComponent(ref),
        headers : {
            authorization: MySecretKey,
            'content-type': 'application/json',
            'cache-control': 'no-cache'
       }
    }
    const callback = (error, response, body)=>{
        return mycallback(error, body);
    }
    request(options,callback);
};




// const paystack = (request) => {

//     const initializePayment = (form, mycallback) => {


//         const options = {
//             url: 'https://api.paystack.co/transaction/initialize',
//             headers: {
//                 authorization: MySecretKey,
//                 'content-type': 'application/json',
//                 'cache-control': 'no-cache'
//             },
//             form
//         };

//         const callback = (error, response, body) => {
//             return mycallback(error, body);
//         }
//         request.post(options, callback);



//     }

//     const verifyPayment = (ref, mycallback) => {}
//     return {
//         initializePayment,
//         verifyPayment
//     };
// }

module.exports = paystack;