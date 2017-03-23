
var map;
var infoWindow;

var request;
var service;
var markers = [];

function initialize() {
    var center = new google.maps.LatLng(-33.633985, 117.733393);
    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 13
    });
    //brian
    var geocoder = new google.maps.Geocoder();

    document.getElementById('submit').addEventListener('click', function() {
        geocodeAddress(geocoder, map);
    });
}

function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    debugger
    geocoder.geocode({'address': address}, (function(results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    })());
    //brian create search box and link it to the element
    // var input = document.getElementById('pac-input');
    // var searchBox = new google.maps.places.SearchBox(input);
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    // map.addListener('bounds_changed', function(){
    //     searchBox.setBounds(map.getBounds());
    // });
    // searchBox.addListener('places_changed', function(){
    //     var places = searchBox.getPlaces();
    //
    //     if (places.length == 0) {
    //         return;
    //     }
    //
    //     // Clear out the old markers.
    //     markers.forEach(function(marker) {
    //         marker.setMap(null);
    //     });
    //     markers = [];
    //
    //     // For each place, get the icon, name and location.
    //     var bounds = new google.maps.LatLngBounds();
    //     places.forEach(function(place) {
    //         if (!place.geometry) {
    //             console.log("Returned place contains no geometry");
    //             return;
    //         }
    //         // var icon = {
    //         //     url: place.icon,
    //         //     size: new google.maps.Size(71, 71),
    //         //     origin: new google.maps.Point(0, 0),
    //         //     anchor: new google.maps.Point(17, 34),
    //         //     scaledSize: new google.maps.Size(25, 25)
    //         // };
    //
    //         // Create a marker for each place.
    //         markers.push(new google.maps.Marker({
    //             map: map,
    //             // icon: icon,
    //             title: place.name,
    //             position: place.geometry.location
    //         }));
    //
    //         if (place.geometry.viewport) {
    //             // Only geocodes have viewport.
    //             bounds.union(place.geometry.viewport);
    //         } else {
    //             bounds.extend(place.geometry.location);
    //         }
    //     });
    //     map.fitBounds(bounds);
    // });
    //brian
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
    if (navigator.geolocation) {
        // var startPos;
        var geoSuccess = function (position) {
            var pos = {
                lat : position.coords.latitude,
                lng : position.coords.longitude
            };
            map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));

            // startPos = position;
            // document.getElementById('startLat').innerHTML = startPos.coords.latitude;
            // document.getElementById('startLon').innerHTML = startPos.coords.longitude;
        };
        navigator.geolocation.getCurrentPosition(geoSuccess);
    } else {
        console.log("Geolocation is not supported for this Browser/OS");
    }
};
//brian
// var geocoder;
// function getYourZip(){
//     geocoder = $('#getZip').val();
//     console.log(zipCode);
//     geocodeAddress(geocoder, map);
// }
// function geocodeAddress(geocoder, resultMaps){
//
// }

//end brian
$(document).ready(function(){
    getLocation();
    initialize();
    //brian
    // $('#sendInfo').click(getYourZip);
    //brian

});

$.ajax({
    data: {
        url: 'http://api.brewerydb.com/v2/styles?key=075d4da050ae5fd39db3ded4fd982c92'
    },
    url: "serverProxy/proxy.php",
    method: "POST",
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
//http://api.brewerydb.com/v2/styles

