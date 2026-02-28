<?php
require_once '../config/database.php';
$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents("php://input"), true) ?? [];
$db     = getDB();

switch ($method) {
    case 'GET':
        $rows = $db->query("SELECT * FROM kategori ORDER BY id_kategori")->fetchAll();
        echo json_encode(["success" => true, "data" => $rows]);
        break;

    case 'POST':
        $nama = trim($input['nama_kategori'] ?? '');
        if (!$nama) { echo json_encode(["success"=>false,"message"=>"Nama wajib diisi"]); break; }
        $db->prepare("INSERT INTO kategori (nama_kategori) VALUES (?)")->execute([$nama]);
        echo json_encode(["success"=>true,"message"=>"Kategori ditambahkan"]);
        break;

    case 'PUT':
        $id   = (int)($input['id_kategori'] ?? 0);
        $nama = trim($input['nama_kategori'] ?? '');
        if (!$id || !$nama) { echo json_encode(["success"=>false,"message"=>"Data tidak lengkap"]); break; }
        $db->prepare("UPDATE kategori SET nama_kategori=? WHERE id_kategori=?")->execute([$nama,$id]);
        echo json_encode(["success"=>true,"message"=>"Kategori diupdate"]);
        break;

    case 'DELETE':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { echo json_encode(["success"=>false,"message"=>"ID tidak ada"]); break; }
        $db->prepare("DELETE FROM kategori WHERE id_kategori=?")->execute([$id]);
        echo json_encode(["success"=>true,"message"=>"Kategori dihapus"]);
        break;

    default:
        echo json_encode(["success"=>false,"message"=>"Method tidak diizinkan"]);
}
