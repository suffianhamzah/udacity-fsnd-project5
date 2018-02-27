// server.js
// where your node app starts

// init project
var express = require('express');
var request = require('request');
var app = express();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// makes an ajax call
app.get("/getYelpData", function (request, response) {

  let yelpAPI = process.env.YELP_API;
  request(
  { method: "GET",
    uri: "https://api.yelp.com/v3/businesses/search",
    qs: request.params,
    headers: { 'Authorization': 'Bearer ' + process.env.YELP_API},

  }
  );
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
