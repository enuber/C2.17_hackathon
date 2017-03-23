
var map;
var infoWindow;

var request;
var service;
var markers = [];
var coordinates = {
    lat: 33.6305353,
    long: -117.74319
};

function initialize() {
    var center = new google.maps.LatLng(33.633985, 117.733393);
    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 13
    });

    request = {
        location: center,
        radius: 8047,
        types: ['cafe'],
        keyword: "starbucks"
    };

    infoWindow = new google.maps.InfoWindow();

    service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request, callback);

    google.maps.event.addListener(map, 'rightclick', function(event){
        map.setCenter(event.latLng);
        clearResults(markers);

        var request = {
            location : event.latLng,
            radius: 8047,
            types : ['cafe'],
            keyword: 'starbucks'
        };

        service.nearbySearch(request, callback);
    })
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            markers.push(createMarker(results[i]));
        }
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
    });
    return marker;
}

function clearResults(markers) {
    for (var m in markers) {
        markers[m].setMap(null)
    }
    markers = [];
}


function getLocation() {
    var coordinates = {};
    if (navigator.geolocation) {
        // var startPos;
        var geoSuccess = function (position) {
            var pos = {
                lat : position.coords.latitude,
                lng : position.coords.longitude
            };
            coordinates.lat = pos.lat;
            coordinates.long = pos.lng;
            map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));

            // startPos = position;
            // document.getElementById('startLat').innerHTML = startPos.coords.latitude;
            // document.getElementById('startLon').innerHTML = startPos.coords.longitude;
        };
        navigator.geolocation.getCurrentPosition(geoSuccess);
    } else {
        console.log("Geolocation is not supported for this Browser/OS");
    }
    return coordinates;
}


$(document).ready(function(){
    getLocation();
    initialize();

});

$.ajax({
    data: {
        url: 'http://api.brewerydb.com/v2/styles?key=075d4da050ae5fd39db3ded4fd982c92'
    },
    url: "serverProxy/proxy.php",
    method: "GET",
    dataType: 'json',
    success: function(result){
        for (var i=0; i<result.data.length; i++) {
            console.log(result.data[i].shortName);
        }
    },
    error: function(){
        console.log('error');
    }
});
http://api.brewerydb.com/v2/styles

//Donald's Yelp Code
/** @summary Does an AJAX call on the Yelp API and assigns the response to the global var 'yelp'
 *
 * Yelp searches require only a location, either as a string, or latitude and longitude.
 * All other parameters and properties are optional.
 *
 * The global var 'yelp' is a copy of the response object. "yelp['coords']" contains an array of
 * all the latitudes and longitudes of all the businesses in the response.
 *
 * @param       keywords:   {string} Search Terms
 * @param       location:   {string} address, neighborhood, city, state or zip, optional country
 *                          {object} Latitude, Longitude
 *
 * @example     location:   "Irvine, CA"
 *              keywords:   "Stout Beer"
 *
 **/
function callYelp(keywords, location){
    // if (typeof location === "object" && !isNaN(location.lat) && !isNaN(location.long)){
    //     long;
    // }
    $.ajax({
        data: {
            "term": keywords,
            "location": location,
            "limit": 11,
            "latitude": -25.363,
            "longitude": 131.044
        },
        url: "serverProxy/yelp/access.php",
        method: "GET",
        dataType: 'json',
        success: function (response) {
            console.log("success: ", response);
            console.log(response.businesses.length);
            console.log(response.businesses[0].name);
            yelp = response;
            yelp.coords = [];
            for (var i = 0;i < response.businesses.length; i++){
                yelp.coords[i] = response.businesses[i].location.coordinate;
                console.log(response.businesses[i].location.coordinate);
            }
        },
        error: function (error) {
            console.log("error: ", error);
        }
    });
}
var yelp = { coords: [] };
callYelp("tonkotsu ramen", "Torrance, CA");