<?php

if (empty($_GET['headers'])){
    readfile($_GET['url']);
} else {
    print_r($_GET);
    $ch = curl_init($_GET['url']);
//    $headers = $_GET['headers'];
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // set headers
    $headers = [];
    foreach(($_GET['headers']) as $key=>$value){
        $headers[] = "$key: $value";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response['data'] = curl_exec($ch);
    curl_close($ch);
    print(json_encode($response));
//    print(json_encode($headers));
}

?>