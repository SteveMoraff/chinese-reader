<?php
// list_folders.php

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

$directory = isset($_GET['path']) ? $_GET['path'] : '';

// Sanitize the directory to prevent directory traversal attacks
$directory = realpath($directory);

// Define allowed base directories
$allowedBases = [
    realpath('stories'),
    realpath('songs')
];

$isAllowed = false;
foreach ($allowedBases as $basePath) {
    if ($directory && strpos($directory, $basePath) === 0 && is_dir($directory)) {
        $isAllowed = true;
        break;
    }
}

if ($isAllowed) {
    $files = scandir($directory);
    $folders = array_filter($files, function($file) use ($directory) {
        return is_dir($directory . DIRECTORY_SEPARATOR . $file) && $file !== '.' && $file !== '..';
    });
    header('Content-Type: application/json');
    echo json_encode(array_values($folders));
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Directory not found or access denied']);
}
?>

