<?php
require_once '../config/database.php';
$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents("php://input"), true) ?? [];
$db     = getDB();

switch ($method) {
    case 'GET':
        echo json_encode(["success"=>true,"data"=>$db->query("SELECT * FROM meja ORDER BY id_meja")->fetchAll()]);
        break;

    case 'POST':
        $kode = trim($input['kode_meja'] ?? '');
        if (!$kode) { echo json_encode(["success"=>false,"message"=>"Kode meja wajib"]); break; }
        $db->prepare("INSERT INTO meja (kode_meja,kapasitas,status) VALUES(?,?,?)")
           ->execute([$kode,(int)($input['kapasitas']??4),$input['status']??'Tersedia']);
        echo json_encode(["success"=>true,"message"=>"Meja ditambahkan"]);
        break;

    case 'PUT':
        $id = (int)($input['id_meja'] ?? 0);
        if (!$id) { echo json_encode(["success"=>false,"message"=>"ID tidak ada"]); break; }
        $db->prepare("UPDATE meja SET kode_meja=?,kapasitas=?,status=? WHERE id_meja=?")
           ->execute([trim($input['kode_meja']??''),(int)($input['kapasitas']??4),$input['status']??'Tersedia',$id]);
        echo json_encode(["success"=>true,"message"=>"Meja diupdate"]);
        break;

    case 'DELETE':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { echo json_encode(["success"=>false,"message"=>"ID tidak ada"]); break; }
        $db->prepare("DELETE FROM meja WHERE id_meja=?")->execute([$id]);
        echo json_encode(["success"=>true,"message"=>"Meja dihapus"]);
        break;

    default:
        echo json_encode(["success"=>false,"message"=>"Method tidak diizinkan"]);
}
