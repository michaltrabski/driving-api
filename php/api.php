<?php

/**
 *  An example CORS-compliant method.  It will allow any GET, POST, or OPTIONS requests from any
 *  origin.
 *
 *  In a production environment, you probably want to be more restrictive, but this gives you
 *  the general idea of what is involved.  For the nitty-gritty low-down, read:
 *
 *  - https://developer.mozilla.org/en/HTTP_access_control
 *  - https://fetch.spec.whatwg.org/#http-cors-protocol
 *
 */
function cors()
{

    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
        // you want to allow, and if so:
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            // may also be using PUT, PATCH, HEAD etc
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }


    // to read file from serwer with javascript fetch just use endpoint like:
    // "https://usun.dacmwwxjyw.cfolks.pl/api.php?slug=allQuestionsDataSlim.json"
    // api.php is a name othis file an it is on server

    // script will find file with name: allQuestionsData.json
    $filename = htmlspecialchars($_GET["slug"]);

    $jsonFileName = $filename;

    if (file_exists($jsonFileName)) {
        $fileContent = file_get_contents($jsonFileName);
        $fileContentDecoded = json_decode($fileContent, true);
        if ($fileContentDecoded === null) {
            // deal with error...
        }
        echo json_encode($fileContentDecoded);
    } else {
        $error = array(
            "error" => true,
            "message" => "file not found",
            "jsonFileName" => $jsonFileName,
            "filename" => $filename
        );
        echo json_encode($error);
    }
}

cors();
