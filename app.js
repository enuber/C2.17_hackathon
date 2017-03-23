
var map;
var infoWindow;

var locationObj = {
    currentLat: null,
    currentLng: null,
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
    if (status == google.maps.places.PlacesServiceStatus.OK) {611
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
                lat : position.coords.latitude,
                lng : position.coords.longitude
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


var foodPairings;
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
                    foodPairings = result.data[i].foodPairings;
                }
            }
        },
        error: function () {
            console.log('error')
        }
    });
}
function submitBeerSelection(){
    // $('#modalContainer').css('display','none');
    $('#domContainer').html('');
    $('#beginSearch').css('display','initial');
    callFoodPairings();
    setTimeout(foodPairingDomCreation,1400);

}
function findYourBeerInit(){
    $('#modalContainer').css('display','initial');
    $('#beginSearch').css('display','none');
    $('#domContainer').html('');
}
function applyClickHandlers(){
    $('#submitBeerButton').click(submitBeerSelection);
    $('#beginSearch').click(findYourBeerInit);
    $(".currentLoc").click(getLocation);
    $(".submit").click(codeAddress);
}
function foodPairingDomCreation(){
    var $div = $('<div>',{
       text: foodPairings,
       class: "domFoodPair"
    });
    $('#domContainer').append($div);
}

var imageContainer = {

}
