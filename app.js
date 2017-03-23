
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
    // getLocation();
    // initialize();

});

// $.ajax({
//     data: {
//         url: 'http://api.brewerydb.com/v2/styles?key=075d4da050ae5fd39db3ded4fd982c92'
//     },
//     url: "serverProxy/proxy.php",
//     method: "GET",
//     dataType: 'json',
//     success: function(result){
//         for (var i=0; i<result.data.length; i++) {
//             console.log(result.data[i].shortName);
//         }
//     },
//     error: function(){
//         console.log('error');
//     }
// });
//http://api.brewerydb.com/v2/styles

//Donald's Yelp Code
/** @summary To do a Yelp Search, pass in parameters as key:value pairs through the data object
 *
 * Yelp searches require only a location, either as a string, or latitude and longitude.
 * All other parameters and properties are optional, but also follow same key/value pair format.
 * @param       location:   {string}
 * @param       keywords:   {string}
 *
 * @example1     location:   "beer"
 * @example2     latitude: 33.6698849,
 *               longitude: -117.7862341
 **/
function callYelp(keywords, location){
    $.ajax({
        data: {
            "term": keywords,
            "location": location
        },
        url: "serverProxy/yelp/access.php",
        method: "GET",
        dataType: 'json',
        success: function (yelp) {
            console.log("success: ", yelp);
        },
        error: function (error) {
            console.log("error: ", error);
        }
    });
}
callYelp("tonkotsu ramen", "Torrance, CA");