/*global ko, $(jquery), google */

var map;

/**
* @description Initializes location data from Yelp API, map and viewModel
*/
function initialize() {
  //separate service for
  yelpRequest('food', 'Sunnyvale', initMap);
}

/**
* @description Alerts the browser when unable to load google maps API
*/
function mapsError() {
  var errorHtml = `<div class="mt-2 alert alert-danger" role="alert">
                     Unable to load Google Maps!
                   </div>`;
  $('#map').html(errorHtml);
}

/**
* @description Initializes map on browser
* @param {Arr(object)} locations - location data
*/
function initMap(locations) {
  var bounds = getCenter(locations);
  map = new google.maps.Map(document.getElementById('map'), {
    //zoom: document.body.clientHeight > 767 ? 14 : 12
    //center: bounds.getCenter()
  });

  map.fitBounds(bounds);
  // Instantiate the ViewModel in initMap, so we now have the scope of initMap!
  console.log(map.getZoom());
  var viewModel = new ViewModel();
  viewModel.center = bounds.getCenter();
  viewModel.locationList(viewModel.createMarkers(locations));
  ko.applyBindings(viewModel);
  }

/**
* @decscription finds center from location longitude and latitudes
* @param {Arr(object)} locations - location data
*
*/
function getCenter(locations) {
  var bounds = new google.maps.LatLngBounds();
  locations.forEach(function(location) {
    bounds.extend( new google.maps.LatLng(
      location.coordinates.latitude,
      location.coordinates.longitude));
  });

  return bounds;
}

/**
* @description takes in a COLOR, and then creates a new marker
* icon of that color. The icon will be 21 px wide by 34 high, have an origin
* of 0, 0 and be anchored at 10, 34).
* @param {string} markerColor - 6 hex string representing a color
* @returns {object} markerImage
*/
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

/**
* @description takes in rating, and will provide a filepath to the yelp rating image
* @param {string} rating - A number ranging from 1 - 5, increments in 0.5
* @returns {string} filepath for the rating's image
*/
function serveRating(rating) {
  // Based on rating number, serve image of stars;
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

/**
* @description populates the infowindow based on marker information and Yelp business data
* @param {object} marker - A Google Maps Marker object
* @param {object} infowindow - A reference to Google Maps InfoWindow object
* @param {object} business - Object containing Yelp Business data
* @returns {string} filepath for the rating's image
*/
function populateInfoWindow(marker, infowindow, business) {

  //Creates infowindow content
  function markup(title, business) {
    return `
      <div class="media">
        <img class="d-flex mr-3 rounded business-img" src="${business.image_url}" alt="Generic placeholder image">
        <div class="media-body">
          <h5 class="mt-0">${title}</h5>
          <div class="hide mb-2"><img src="${serveRating(business.rating)}" alt="${business.rating}">
            <span class="pl-2 align-middle">${business.review_count} reviews</span>
          </div>
          <address class="mb-0">
            ${business.location.display_address.map(function(addr) {return `${addr}<br>`;}).join('')}
            Phone: ${business.display_phone}
            <br>
            Price: ${business.price}
          </address>
          <div>
            <a class="mr-auto" href="${business.url}" target="blank"><img class="float-right" src="/assets/Yelp_trademark_RGB_outline.png" height="48"></a>
          </div>
        </div>
      </div>`;
  }
  if (infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;
    infowindow.setContent(markup(marker.title, business));
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
    map.setZoom(document.body.clientHeight > 767 ? 14 : 12);
    map.panTo(marker.getPosition());
    // Make sure the marker property is cleared if the infowindow is closed.
  }
}

/**
* @description A KO ViewModel object containing the logic for the list item, and
* behaviors for markers and infowindow
*/
var ViewModel = function() {
  var self = this;
  self.center;
  self.locationList = ko.observableArray([]);
  self.currentLocationIndex = ko.observable();
  self.highlightedIcon = makeMarkerIcon('FFFF24');
  self.defaultIcon = makeMarkerIcon('0091ff');
  self.query = ko.observable('');
  self.locationTerm = ko.observable('');
  self.foodTerm = ko.observable('');

  self.infoWindow = new google.maps.InfoWindow({
    maxWidth: document.body.clientHeight > 767 ? 375 : 250
  });

  self.infoWindow.addListener('closeclick', function() {
    self.infoWindow.marker = null;
    map.setZoom(document.body.clientHeight > 767 ? 14 : 12);
    map.panTo(self.center);
    self.currentLocationIndex(null);
  });
  /**
  * @description Creates Google Maps Marker objects from location data
  * @param {array(object)} locations - An array of location objects
  */
  self.createMarkers = function(locations) {
    return locations.map(function(location) {
      var marker = new google.maps.Marker({
        position: {lat: location.coordinates.latitude, lng: location.coordinates.longitude},
        map: map,
        title: location.name,
        icon: self.defaultIcon
      });

      marker.addListener('click', function() {
        populateInfoWindow(this, self.infoWindow, location);
        this.setAnimation(google.maps.Animation.BOUNCE);
        var mark = this;
        setTimeout(function() {
          mark.setAnimation(null);
        }, 700);
        self.currentLocationIndex(location);
      });

      marker.addListener('mouseover', function() {
        this.setIcon(self.highlightedIcon);
      });

      marker.addListener('mouseout', function() {
        this.setIcon(self.defaultIcon);
      });
      return {
        title: location.name,
        marker: marker,
        business : location
      };
    });
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
      });
    }
  }, self);

  /**
  * @description Triggers the 'click' event for a Google Maps Marker
  * @param {object} location - An location object
  */
  self.openInfoWindow = function(location) {
    google.maps.event.trigger(location.marker, 'click');
    self.currentLocationIndex(location.business);
  };

  /**
  * @description Triggers the 'mouseover' event for a Google Maps Marker
  * @param {object} location - An location object
  */
  self.makeMarkerBounce = function(location) {
    google.maps.event.trigger(location.marker, 'mouseover');
  };

  /**
  * @description Triggers the 'mouseout' event for a Google Maps Marker
  * @param {object} location - An location object
  */
  self.makeMarkerNotBounce = function(location) {
    google.maps.event.trigger(location.marker, 'mouseout');
    location.marker.setIcon(self.defaultIcon);
  };

  /**
  * @description A wrapper KO function for the serveRating function
  * @param {string} rating - An location object
  */
  self.serveRating = function(rating) {
    return serveRating(rating);
  };

  /**
  * @description KO function for getting data from form and calls yelpRequest
  * @param {string} rating - An location object
  */
  self.getNewYelpList = function() {
    var food = self.foodTerm;
    var location = self.locationTerm ? self.locationTerm : 'Sunnyvale';
    yelpRequest(food, location, self.updateMap);
  };
  self.removeMarkers = function() {
    ko.utils.arrayForEach(self.locationList(), function(location) {
      location.marker.setMap(null);
    });
    self.locationList([]);
  };

  self.updateMap = function(locations) {
    // calculate new center, get new locations
    var bounds = getCenter(locations);
    self.center =  bounds.getCenter();
    console.log(bounds.getCenter());
    /*
      google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
  if (this.getZoom() > 10) {
    this.setZoom(10);
  }
  });
    map.setCenter(self.center);
    */
    map.setCenter(bounds.getCenter());
    map.panToBounds(bounds);
    map.fitBounds(bounds);
    console.log(map.getZoom());
    console.log(map.getCenter());
    // clears list markers and create new
    self.removeMarkers();
    self.locationList(self.createMarkers(locations));
  };
};

/**
* @description AJAX request for getting the Yelp Access token, and then getting the location data * from Yelp API
* @param {string} searchTerm - term to search for e.g. food, deli
* @param {string} locationStr - Place of where to search from
* @param {function} callback - Callback function once data is successfully obtained
*/
var yelpRequest = function(searchTerm, locationStr, callback) {
  var params = {
    term: searchTerm,
    location: locationStr
  };

  /**
  * @description AJAX GET request to Yelp to obtain data
  * @param {string} accessToken - Yelp's access token for authenticating API request
  */
  $.ajax({
    url: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search',
    data: params,
    headers: { 'Authorization': 'Bearer ' + 'Gyup0cuo2-tAVdoRRYU66NCrnedTuPzbW5KjHjUSbPw_kE7ox7v6Icfy7dSmjzcrvZY6M_tV3bt8_ealRE2mH95_Aojzagm-OBV7QOTE9sJbBL5V6ZyThtL_e2eeWXYx' },
    method: 'GET',
    dataType: 'json',
    cache: true
  }).done(function(data) {
    callback(data.businesses);
  }).fail(function() {
    alert('Failed to load Yelp API');
  });

}