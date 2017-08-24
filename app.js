
// Model
var locations = [
{ name: 'Yellowstone National Park',
state: 'WY',
country: 'USA',
lat: 44.427895,
lng: -110.588379 },
{ name: 'Rothrock State Forest',
state: 'PA',
country: 'USA',
lat: 40.720585,
lng: -77.826965 },
{ name: 'Yosemite National Park',
state: 'CA',
country: 'USA',
lat: 37.865101,
lng: -119.538330}];

const mapItem = function mapDataModel(data) {
  this.name = data.name;
  this.active = ko.observable(false);

};

var map, center, largeInfoWindow;
function initialize() {
  yelp_request_2('food');
  request('Sunnyvale', initMap);
}
function initMap(events) {
  var markers = [];
  var bounds = new google.maps.LatLngBounds();
  //Instantiate the ViewModel in initMap, so we now have the scope of initMap!
  var viewModel = new ViewModel();
  ko.applyBindings(viewModel);
  console.log(events[0])
  events.forEach(function(location) {
    bounds.extend( new google.maps.LatLng(parseFloat(location.venue.latitude), parseFloat(location.venue.longitude)));
  });

  /*
  locations.forEach(function(location) {
    bounds.extend( new google.maps.LatLng(location.latitude, location.long));
  });
  */
  center = bounds.getCenter();
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: center
  });

  var defaultIcon = makeMarkerIcon('0091ff');
  var locations = events;
  largeInfoWindow = new google.maps.InfoWindow();
  largeInfoWindow.addListener('closeclick', function() {
    largeInfoWindow.marker = null;
    map.setZoom(10);
    map.setCenter(center);
    viewModel.currentLocationIndex(null);
  });

  viewModel.infoWindow = largeInfoWindow;

  var markers = locations.map(function(location, index) {
    let marker = new google.maps.Marker({
      position: {lat: parseFloat(location.venue.latitude), lng: parseFloat(location.venue.longitude)},
      map: map,
      title: location.name.text,
      icon: defaultIcon
    });

    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfoWindow);
      viewModel.currentLocationIndex(index);
    });

    marker.addListener('mouseover',function() {
      //this.setAnimation(google.maps.Animation.BOUNCE);
      this.setIcon(defaultIcon);
    });

    marker.addListener('mouseout',function() {
      //this.setAnimation(null);
      this.setIcon(defaultIcon);
    });
    return {
      title: location.venue.name,
      marker: marker
    };
  });
  //Add markers to viewModel
  viewModel.locationList(markers);


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

      function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('');
      infowindow.marker = marker;

      infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
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
    self.infoWindow;
    self.locationList = ko.observableArray([]);
    self.currentLocationIndex = ko.observable(null);
    self.highlightedIcon = makeMarkerIcon('FFFF24');
    self.defaultIcon = makeMarkerIcon('0091ff');
  // Input box to filter objects
  self.query = ko.observable('');
  self.toggleVisibility = function(locationList) {
    locationList.forEach(function(item) {
      item.marker.setVisible(true);
    });
  };

  // with reference from http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
  self.filteredList = ko.computed(function() {
    var filter = self.query().toLowerCase();
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
    populateInfoWindow(location.marker, self.infoWindow);
    //TODO: Fix the highlighting, maybe add a property to the list
    self.currentLocationIndex(self.locationList.indexOf(location));
    console.log(self.currentLocationIndex());
  };
  self.makeMarkerBounce = function(location) {
    location.marker.setIcon(self.highlightedIcon);
    //location.marker.setAnimation(google.maps.Animation.BOUNCE);
  };

  self.makeMarkerNotBounce = function(location) {
    location.marker.setIcon(self.defaultIcon);
    if (location.marker.getAnimation() !== null) {
      location.marker.setAnimation(null);
    }
  };
};


NPS_API = '75861333-AF8F-47CE-85F3-8FAB0209987D';
NPS_BASE_URL = 'https://developer.nps.gov/api/v0';


baseURL = 'https://www.eventbriteapi.com/v3/';
var jqxhr = function(latLng) {

  $.ajax( "example.json", function() {
    console.log( "success" );
  })
  .done(function() {
    console.log( "second success" );
  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "complete" );
  });
};

// events = request('Sunnyvale');
var request = function(address, callback) {
  var events;
  $.ajax({
    url: "https://www.eventbriteapi.com/v3/events/search/",
    method: "GET",
    data: { 'token' : 'JLYZPYK6UIYN3SUGQNKB',
    'location.within': '10mi',
    'location.address': address,
    'expand': 'venue' },
    dataType: "json"
  }).done(function( data ) {
    events = data.events;
    callback(events);
  }).fail(function( jqXHR, textStatus ) {
    alert( "Request failed: " + textStatus );
    return null;
  });
}

const yelpKey = {
  clientId: 'XkRViyzWBDNefgBRi3llMw',
  clientSecret: 'LxCJ6jrkXIdB6PQlO9fggqh9UOL0fRvfMuwcM7qkjwC1UMH1p5xunMd2vlBJdQzG'
};


function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

var yelp_request_2 = function(searchTerm) {
  var access_token = 'Bearer Gyup0cuo2-tAVdoRRYU66NCrnedTuPzbW5KjHjUSbPw_kE7ox7v6Icfy7dSmjzcrvZY6M_tV3bt8_ealRE2mH95_Aojzagm-OBV7QOTE9sJbBL5V6ZyThtL_e2eeWXYx';
  let myHeaders = new Headers();
  myHeaders.append("Authorization", access_token);

  fetch("https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?categories=bars&limit=50&location=New York", {
    headers: myHeaders
  }).then((res) => {
    return res.json();
  }).then((json) => {
    console.log(json);
  });

  $.ajax({
    url: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/oauth2/token',
    method: 'POST',
    dataType: 'json',
    data: {
      client_id:'XkRViyzWBDNefgBRi3llMw',
      client_secret:'LxCJ6jrkXIdB6PQlO9fggqh9UOL0fRvfMuwcM7qkjwC1UMH1p5xunMd2vlBJdQzG',
      grant_type:'client_credentials'
    },
    success: function(data) {
      console.log(data);
    }
  })
  $.ajax({
    url: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=delis&latitude=37.786882&longitude=-122.399972',
    //data: params,
    headers: { 'Authorization': access_token },
    method: 'GET',
    dataType: 'json',
    success: function(data) {
      console.log(data);
    },
    error: function(jqxhr, text) {
      console.log(text);
    }
  });
};
//TODO
/*
get endpoint to show data
get data and populate list + marker
Have option to filter by text, filter
Figure out what to show on infowindow
*/