

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
lng: -119.538330}]

const mapItem = function mapDataModel(data) {
  this.name = data.name;
  this.lat = data.lat;
  this.lng = data.lng;
  this.active = ko.observable(false);

}

function initMap() {
  var markers = [];
  var bounds = new google.maps.LatLngBounds();

  locations.forEach(function(location) {
    bounds.extend( new google.maps.LatLng(location.lat, location.lng));
  })
  var center = bounds.getCenter();
  var uluru = {lat: -25.363, lng: 131.044};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: center
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });

  markers = locations.map(function(location) {

    let marker = new google.maps.Marker({
      position: {lat: location.lat, lng: location.lng},
      map: map,
      title: location.name
    })

    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
      map.setZoom(8);
      map.setCenter(this.getPosition());
    });
    return marker
  })
  var largeInfowindow = new google.maps.InfoWindow();

  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetview time to load.
      infowindow.setContent('');
      infowindow.marker = marker;

      infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
      // Open the infowindow on the correct marker.
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
        map.setZoom(4);
        map.setCenter(center);
      });
    }
  }
}

var ListViewModel = function(locations) {
  var self = this;

  self.locationList = locations;
  self.chosenLocation = ko.observable();

}
  //main ViewModel, where the modal will pop up
  var ViewModel = function(locations) {
    var self = this;

    self.locationList = locations;
    self.setActive = function() {
      self.createMarker
    }
  }

  var viewModel = new ViewModel(locations || []);
  ko.applyBindings(viewModel);
  NPS_API = '75861333-AF8F-47CE-85F3-8FAB0209987D';
  NPS_BASE_URL = 'https://developer.nps.gov/api/v0';
  console.log(initMap)