<?php
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Method tidak diizinkan"]); exit();
}

$input    = json_decode(file_get_contents("php://input"), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (!$username || !$password) {
    echo json_encode(["success" => false, "message" => "Username dan password wajib diisi"]); exit();
}

$db   = getDB();
$stmt = $db->prepare("SELECT id_user, username, email, role FROM user WHERE username=? AND password=? AND status='aktif'");
$stmt->execute([$username, $password]);
$user = $stmt->fetch();

if ($user) {
    echo json_encode(["success" => true, "data" => $user]);
} else {
    echo json_encode(["success" => false, "message" => "Username/password salah atau akun tidak aktif"]);
}
