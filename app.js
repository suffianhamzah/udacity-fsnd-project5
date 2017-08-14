var locations = [
{ name: 'Yellowstone National Park',
  state: 'WY',
  country: 'USA',
  lat: '44.427895',
  lng: '-110.588379'
},
{ name: 'Rothrock State Forest',
  state: 'PA',
  country: 'USA',
  lat: '40.720585',
  lng: '-77.826965'
},
{ name: 'Yosemite National Park',
  state: 'CA',
  country: 'USA',
  lat: '37.865101',
  lng: '-119.538330'
}]

const mapItem = function mapDataModel(data) {
  this.name = data.name;
  this.lat = data.lat;
  this.lng = data.lng;
  this.active = ko.observable(false);

}

function initMap() {

  var uluru = {lat: 37.865101, lng: -119.538330};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: uluru
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
}

var ViewModel= {
  locations:locations,
  setActive: function() {

  }
}

ko.applyBindings(ViewModel);
NPS_API = '75861333-AF8F-47CE-85F3-8FAB0209987D';
NPS_BASE_URL = 'https://developer.nps.gov/api/v0';


