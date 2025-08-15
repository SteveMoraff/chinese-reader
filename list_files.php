<?php
// list_files.php

// Get the directory from the query parameter
$directory = isset($_GET['path']) ? $_GET['path'] : '';

// Sanitize the directory to prevent directory traversal attacks
$directory = realpath($directory);

// Ensure the directory is within the allowed base path
$basePath = realpath('stories'); // Set this to the base path where your directories are allowed
if ($directory && strpos($directory, $basePath) === 0 && is_dir($directory)) {
    $files = scandir($directory);
    // Filter to only include .txt files
    $txtFiles = array_filter($files, function($file) use ($directory) {
        return is_file($directory . DIRECTORY_SEPARATOR . $file) && pathinfo($file, PATHINFO_EXTENSION) === 'txt';
    });

    // Return JSON response with all .txt filenames
    header('Content-Type: application/json');
    echo json_encode(array_values($txtFiles));
} else {
    // Return an error if the directory does not exist or is invalid
    http_response_code(404);
    echo json_encode(['error' => 'Directory not found or access denied']);
}
?>

