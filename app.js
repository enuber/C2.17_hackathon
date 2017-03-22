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

function callFoodPairings() {
    $.ajax({
        data: {
            url: 'http://api.brewerydb.com/v2/beers?key=075d4da050ae5fd39db3ded4fd982c92&name=Imperial%20IPA'
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
