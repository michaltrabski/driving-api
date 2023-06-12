<?php
    /* node.js upload target ~ "upload.php" */
    if( isset( $_FILES ) ){
        /* change path to suit environment */

        // check i file is media eg: png, mp4, jpg... and place them in media subfolder 
        // $mediaTypesArray = [".png"];
        // $dir= in_array( $val, $array_name, $mode );

        $dir = '';

        $obj=(object)$_FILES['file'];
        $name=$obj->name;
        $tmp=$obj->tmp_name;

        $result = move_uploaded_file( $tmp, $dir.$name );
        echo $result ? 'File '.$name.' ws moved to '.$dir : 'Error: Failed to save '.$name;
    }
?>