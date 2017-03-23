
var map;
var infoWindow;
var locationObj = {
    lat : null,
    long : null
};
var markers = [];
var geocoder;
var tempCoors = [{lat: 33.636193,lng: -117.739393},{lat: 33.643590, lng:-117.743731},{lat: 33.646095,lng:-117.744373}];

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
        },
        scaleControl: true
    });

    infoWindow = new google.maps.InfoWindow();  // can add content here
}
function createMarker() {
    for (var i = 0; i < tempCoors.length; i++) {
        var coordinates = tempCoors[i];
        var marker = new google.maps.Marker({
            map: map,
            position: coordinates
        });
        markers.push(marker);
    }
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
    });
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
            locationObj.lat = pos.lat;
            locationObj.long = pos.lng;
        };
        navigator.geolocation.getCurrentPosition(geoSuccess);
    } else {
        console.log("Geolocation is not supported for this Browser/OS");
    }
}

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
    $('#getLocationButton').click(getLocation);
    $('.submit').click(codeAddress);
}
function foodPairingDomCreation(){
    var $div = $('<div>',{
       text: foodPairings,
       class: "domFoodPair"
    });
    $('#domContainer').append($div);
}

// var imageContainer = {
//
// }
