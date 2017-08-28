/*global ko, $ (jquery), and google */

'use strict';
var map;
/**
* @description Initializes location data from Yelp API, map and viewModel
* @gets data from Yelp API, and then creates the Map
*/
function initialize() {
  //separate service for
  yelpRequest('food', 'Sunnyvale', initMap);
}

function mapsError() {
 var errorHtml = `
 <div class="alert alert-info" role="alert">
 This is a info alert—check it out!
 </div>
 `;
 $('#map').html(errorHtml);
}

function initMap(locations) {
  var center;
  var bounds = new google.maps.LatLngBounds();

  locations.forEach(function(location) {
    bounds.extend( new google.maps.LatLng(
      location.coordinates.latitude,
      location.coordinates.longitude));
  });

  center = bounds.getCenter();
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    center: center
  });
    //Instantiate the ViewModel in initMap, so we now have the scope of initMap!
    var viewModel = new ViewModel();
    viewModel.center = center;
    viewModel.locationList(viewModel.createMarkers(locations));
    ko.applyBindings(viewModel);
  }
// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

function serveRating(rating) {
  //Based on rating number, serve image of stars;
  const path = 'assets/yelp_stars/web_and_ios/regular/';
  const ratingMap = {
    0: 'regular_0',
    1: 'regular_1',
    1.5: 'regular_1_half',
    2: 'regular_2',
    2.5: 'regular_2_half',
    3: 'regular_3',
    3.5: 'regular_3_half',
    4: 'regular_4',
    4.5: 'regular_4_half',
    5: 'regular_5'
  };

  return `assets/yelp_stars/web_and_ios/regular/${ratingMap[rating]}.png`;
}

function populateInfoWindow(marker, infowindow, business) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('');
      infowindow.marker = marker;
      console.log('rating: ' + business.rating);
      //Content Info HTML??
      function markup(title, business) {
        return `
        <div class="media">
        <img class="d-flex mr-3 rounded business-img" src="${business.image_url}" alt="Generic placeholder image">
        <div class="media-body">
        <h5 class="mt-0">${title}</h5>
        <div class="mb-2"><img src="${serveRating(business.rating)}"><span class="pl-2 align-middle">${business.review_count} reviews</span></div>
        <address class="mb-0">
        ${business.location.display_address.map(addr => `${addr}<br>`).join('')}
        Phone: ${business.display_phone}
        </address>
        <div>
        <a class="mr-auto"href="${business.url}" target="blank"><img class="float-right" src="/assets/Yelp_trademark_RGB_outline.png" height="48"></a>
        <p>${business.price}</p>
        </div>
        </div>
        </div>
        `;
      }
      infowindow.setContent(markup(marker.title, business));
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
      map.setZoom(15);
      map.setCenter(marker.getPosition());
      // Make sure the marker property is cleared if the infowindow is closed.
    }
  }

//main ViewModel, where the modal will pop up
var ViewModel = function() {
  var self = this;
  self.center;
  self.locationList = ko.observableArray([]);
  self.currentLocationIndex = ko.observable();
  self.highlightedIcon = makeMarkerIcon('FFFF24');
  self.defaultIcon = makeMarkerIcon('0091ff');
  self.query = ko.observable('');

  // infoWindow
  self.infoWindow = new google.maps.InfoWindow({
    maxWidth: 375
  });
  self.infoWindow.addListener('closeclick', function() {
    self.infoWindow.marker = null;
    map.setZoom(14);
    map.setCenter(self.center);
    self.currentLocationIndex(null);
  });
  //create marker function
  // takes in an array of locations
  self.createMarkers = function(locations) {
    return locations.map(function(location) {
      let marker = new google.maps.Marker({
        position: {lat: location.coordinates.latitude, lng: location.coordinates.longitude},
        map: map,
        title: location.name,
        icon: self.defaultIcon
      });

      marker.addListener('click', function() {
        populateInfoWindow(this, self.infoWindow, location);
        //this.setIcon(self.highlightedIcon);
        self.currentLocationIndex(location);
      });

      marker.addListener('mouseover',function() {
        //this.setAnimation(google.maps.Animation.BOUNCE);
        this.setIcon(self.highlightedIcon);
      });

      marker.addListener('mouseout',function() {
        //this.setAnimation(null);
        this.setIcon(self.defaultIcon);
      });
      return {
        title: location.name,
        marker: marker,
        business : location
      };
    });
    //Add markers to viewModel
  };
  // with reference from http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  self.filteredList = ko.computed(function() {
    var filter = self.query().toLowerCase();
    self.infoWindow.close();
    map.setZoom(14);
    map.setCenter(self.center);
    self.currentLocationIndex(null);
    if (!filter) {
      ko.utils.arrayForEach(self.locationList(), function(location) {
        location.marker.setVisible(true);
      });
      return self.locationList();
    } else {
      ko.utils.arrayForEach(self.locationList(), function(location) {
        location.marker.setVisible(false);
      });
      return ko.utils.arrayFilter(self.locationList(), function(item) {
        if (item.title.toLowerCase().indexOf(filter) !== -1) {
          item.marker.setVisible(true);
          return item;
        }
        // return item.title.toLowerCase().startsWith(filter);
      });
    }
  }, self);

  self.openInfoWindow = function(location) {
    google.maps.event.trigger(location.marker,'click');
    self.currentLocationIndex(location.business);
  };
  self.makeMarkerBounce = function(location) {
    google.maps.event.trigger(location.marker, 'mouseover');
  };

  self.makeMarkerNotBounce = function(location) {
    google.maps.event.trigger(location.marker, 'mouseout');
    location.marker.setIcon(self.defaultIcon);
  };

  self.serveRating= function(rating) {
    return serveRating(rating);
  };
};


const yelpKey = {
  clientId: 'XkRViyzWBDNefgBRi3llMw',
  clientSecret: 'LxCJ6jrkXIdB6PQlO9fggqh9UOL0fRvfMuwcM7qkjwC1UMH1p5xunMd2vlBJdQzG'
};


var yelpRequest = function(searchTerm, locationStr, callback) {
  var params = {
    term: searchTerm,
    location: locationStr
  };

  function getLocations(accessToken){
    console.log(accessToken);
    $.ajax({
      url: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search',
      data: params,
      headers: { 'Authorization': accessToken },
      method: 'GET',
      dataType: 'json',
      cache: true
    }).done(function(data) {
      callback(data.businesses);
    }).fail(function() {
      alert('Failed to load Yelp API');
    });
  }

  // Get access Token
  $.ajax({
    url: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/oauth2/token',
    method: 'POST',
    dataType: 'json',
    cache: true,
    data: {
      client_id:'XkRViyzWBDNefgBRi3llMw',
      client_secret:'LxCJ6jrkXIdB6PQlO9fggqh9UOL0fRvfMuwcM7qkjwC1UMH1p5xunMd2vlBJdQzG',
      grant_type:'client_credentials'
    }
  }).done(function(data) {
    console.log(data);
    getLocations('Bearer ' + data.access_token);
  }).fail(function() {
    alert('Unable to authenticate with Yelp!');
  });
};


//TODO
/*
do one ajax request to get info on business?
get data and populate list + marker
*/
