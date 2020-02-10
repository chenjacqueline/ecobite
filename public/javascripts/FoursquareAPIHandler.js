// const request = require("request");
// const axios = require("axios");
// class APIHandler {
//   constructor(baseUrl) {
//     this.BASE_URL = baseUrl;
//   }

//   getRestaurantList() {
//     return axios
//       .get(
//         `https://api.foursquare.com/v2/venues/explore?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&v=20180323&limit=20&ll=52.5200,13.40508&query=food`
//       )
//       .then(response => {
//         // Code for handling API response
//         return response;
//       })
//       .catch(err => {
//         // Code for handling errors
//         console.log(err);
//       });
//   }
// }

// axios.get("https://api.foursquare.com/v2/venues/explore").then(response => {
//   res.json()
//   });

// request(
//   {
//     url: "https://api.foursquare.com/v2/venues/explore",
//     method: "GET",
//     qs: {
//       client_id: "CLIENT_ID",
//       client_secret: "CLIENT_SECRET",
//       ll: "40.7243,-74.0018",
//       query: "coffee",
//       v: "20180323",
//       limit: 1
//     }
//   },
//   function(err, res, body) {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log(body);
//     }
//   }
// );
