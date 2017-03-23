
var map;
var infoWindow;

var locationObj = {
    currentLat : null,
    currentLng : null
}
var request;
var service;
var markers = [];
var geocoder;

function initialize() {
    geocoder = new google.maps.Geocoder();
    var center = new google.maps.LatLng(37.09024, -100.712891);
    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 13,
        panControl: false,
        mapTypeControl: false,
        zoomControl: true,
        streetViewControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    });
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
    //end brian autocomplete code, trouble with geolocation
    request = {
        location: center,
        radius: 8047,
        types: ['cafe'],
        keyword: "starbucks"
    };

    infoWindow = new google.maps.InfoWindow();  // can add content here

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
//brian
// function thisIsForYelp(place){
//     var placeLoc = place.geometry.location;
//     var image = 'http://emojipedia-us.s3.amazonaws.com/cache/bb/cc/bbcc10a5639af93ab107cc2349700533.png';
//         // size: new google.maps.Size(100, 100)
//     // };
//     var beachMarker = new google.maps.Marker({
//         position: place.geometry.location,
//         map: map,
//         // size: new google.maps.Size(20,32),
//         icon: image
//     });
//     google.maps.event.addListener(beachMarker, 'click', function(){
//         infoWindow.setContent(place.name);
//         infoWindow.open(map,this);
//     });
//     return beachMarker;
// }
//brian
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
function codeAddress() {
    var address = $(".address").val();
    geocoder.geocode({'address': address}, function(results, status){
        if (status == 'OK'){
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    })
}
function getLocation() {
    if (navigator.geolocation) {
        var geoSuccess = function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));
            locationObj.currentLat = pos.lat;
            locationObj.currentLng = pos.lng;
        };

        navigator.geolocation.getCurrentPosition(geoSuccess);
    } else {
        console.log("Geolocation is not supported for this Browser/OS");
    }
};
function startUp () {
    initialize();
    applyClickHandlers();
}
$(document).ready(function(){
    startUp();
});

// function callBeerStyle() {
//     $.ajax({
//         data: {
//             url: 'http://api.brewerydb.com/v2/styles?key=075d4da050ae5fd39db3ded4fd982c92'
//         },
//         url: "serverProxy/proxy.php",
//         method: "GET",
//         dataType: 'json',
//         success: function (result) {
//             for (var i = 0; i < result.data.length; i++) {
//                 console.log(result.data[i].shortName);
//             }
//         },
//         error: function () {
//             console.log('error');
//         }
//     });
// }

//
function callFoodPairings() {
    var beerSelected = $('input:checked').val();
    $.ajax({
        data: {
            url: 'http://api.brewerydb.com/v2/beers?key=075d4da050ae5fd39db3ded4fd982c92&name=' + beerSelected
        },
        url: 'serverProxy/proxy.php',
        method: 'GET',
        dataType: 'json',
        success: function (result) {
            for (var i = 0; i < result.data.length; i++) {
                if (result.data[i].foodPairings !== undefined) {
                    console.log(result.data[i].foodPairings);
                }
            }
        },
        error: function () {
            console.log('error')
        }
    });
}
function submitBeerSelection(){
    $('#modalContainer').css('display','none');
    $('#beginSearch').css('display','initial');
    callFoodPairings();

}
function findYourBeerInit(){
    $('#modalContainer').css('display','initial');
    $('#beginSearch').css('display','none');
}
function applyClickHandlers(){
    $('#submitBeerButton').click(submitBeerSelection);
    $('#beginSearch').click(findYourBeerInit);
    $(".currentLoc").click(getLocation);
    $(".submit").click(codeAddress);
}


