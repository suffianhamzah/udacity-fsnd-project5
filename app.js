
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
function initMap() {
  var markers = [];
  var bounds = new google.maps.LatLngBounds();
  //Instantiate the ViewModel in initMap, so we now have the scope of initMap!
  var viewModel = new ViewModel();
  ko.applyBindings(viewModel);

  locations.forEach(function(location) {
    bounds.extend( new google.maps.LatLng(location.lat, location.lng));
  });

  center = bounds.getCenter();
  var uluru = {lat: -25.363, lng: 131.044};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: center
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
  largeInfoWindow = new google.maps.InfoWindow();
  largeInfoWindow.addListener('closeclick', function() {
    largeInfoWindow.marker = null;
    map.setZoom(4);
    map.setCenter(center);
    viewModel.currentLocationIndex(null);
  });
  viewModel.infoWindow = largeInfoWindow;
  console.log(viewModel.infoWindow);
  var markers = locations.map(function(location, index) {

    let marker = new google.maps.Marker({
      position: {lat: location.lat, lng: location.lng},
      map: map,
      title: location.name
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
      title: location.name,
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
      map.setZoom(8);
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
    self.openInfoWindow = function(location) {
      populateInfoWindow(location.marker, self.infoWindow);
      self.currentLocationIndex(self.locationList.indexOf(location));
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
  console.log(initMap)