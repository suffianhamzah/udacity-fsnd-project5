
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
  request('Sunnyvale');
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

  var locations = events;
  largeInfoWindow = new google.maps.InfoWindow();
  largeInfoWindow.addListener('closeclick', function() {
    largeInfoWindow.marker = null;
    map.setZoom(10);
    map.setCenter(center);
    viewModel.currentLocationIndex(null);
  });
  viewModel.infoWindow = largeInfoWindow;
  console.log(viewModel.infoWindow);
  var markers = locations.map(function(location, index) {
    console.log(parseInt(location.venue.latitude));
    console.log(parseInt(location.venue.longitude));
    console.log(location.name.text);
    let marker = new google.maps.Marker({
      position: {lat: parseFloat(location.venue.latitude), lng: parseFloat(location.venue.longitude)},
      map: map,
      title: location.name.text
    });

    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfoWindow);
      viewModel.currentLocationIndex(index);
    });

    marker.addListener('mouseover',function() {
      this.setAnimation(google.maps.Animation.BOUNCE);
    });

    marker.addListener('mouseout',function() {
      this.setAnimation(null);
    });
    return {
      title: location.venue.name,
      marker: marker
    };
  });
  //Add markers to viewModel
  viewModel.locationList(markers);


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
        if (item.title.toLowerCase().startsWith(filter)) {
          item.marker.setVisible(true);
          return item;
        }
        // return item.title.toLowerCase().startsWith(filter);
      });
    }
  }, self);

  self.openInfoWindow = function(location) {
    populateInfoWindow(location.marker, self.infoWindow);

    self.currentLocationIndex(self.filteredList.indexOf(location));
    console.log(self.currentLocationIndex());
  };
  self.makeMarkerBounce = function(location) {

    location.marker.setAnimation(google.maps.Animation.BOUNCE);
  };

  self.makeMarkerNotBounce = function(location) {
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
var request = function(address) {
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
    initMap(events);
  }).fail(function( jqXHR, textStatus ) {
    alert( "Request failed: " + textStatus );
    return null;
  });
}
//TODO
/*
get endpoint to show data
get data and populate list + marker
Have option to filter by text, filter
Figure out what to show on infowindow
*/