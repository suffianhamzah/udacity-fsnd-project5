/* eslint-env node, mocha */
// server.js
// where your node app starts

// init project
var express = require('express');
var rp = require('request-promise-native');
var app = express();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// makes an ajax call
app.get('/getYelpData', function (request, response) {
  let options = {
    uri: 'https://api.yelp.com/v3/businesses/search',
    qs: request.query,
    headers: { 'Authorization': 'Bearer ' + process.env.YELP_API}
  };
  console.log(options);
  rp(options)
    .then(function (businesses) {
      console.log('Successfully obtained yelp data!');
      response.send(businesses);
    })
    .catch(function (err) {
      console.log(`API call failed due to ${err}`);
    });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
