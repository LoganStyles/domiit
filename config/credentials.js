// {
//     "cookieSecret":"dfkjdlsfjljklsdfj",
//     "facebook":{
//         "app_id":"2047896521895761",
//         "app_secret":"f249877c543a7a3021bc60a2b45b162e",
//         "callback":"http://localhost:8000/auth/facebook/callback"
//     },
//     "twitter":{
//         "consumer_key":"akeyishere",
//         "consumer_secret":"mysecretisbetterthanyoursecret",
//         "callback":"http://localhost:3000/auth/twitter/callback"
//     },
//     "mongo":{
//         "development":{
//             "connectionString":process.env.MONGODB_URI
//         },
//         "production":{}
//     }
// }

module.exports = {
    cookieSecret:"dfkjdlsfjljklsdfj",
    facebook:{
        app_id:"2047896521895761",
        app_secret:"f249877c543a7a3021bc60a2b45b162e",
        callback:"http://localhost:8000/auth/facebook/callback"
    },
    twitter:{
        consumer_key:"akeyishere",
        consumer_secret:"mysecretisbetterthanyoursecret",
        callback:"http://localhost:3000/auth/twitter/callback"
    },
    mongo:{
        development:{
            "connectionString":process.env.MONGODB_URI
        },
        production:{}
    }
}