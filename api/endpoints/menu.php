<?php
require_once '../config/database.php';
$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents("php://input"), true) ?? [];
$db     = getDB();

switch ($method) {
    case 'GET':
        $sql = "SELECT m.id_menu, m.nama_menu, m.harga, m.id_kategori,
                       COALESCE(k.nama_kategori,'—') as nama_kategori,
                       m.deskripsi, m.stok
                FROM menu m
                LEFT JOIN kategori k ON m.id_kategori=k.id_kategori
                ORDER BY m.id_menu";
        echo json_encode(["success"=>true,"data"=>$db->query($sql)->fetchAll()]);
        break;

    case 'POST':
        $nama = trim($input['nama_menu'] ?? '');
        $harga = floatval($input['harga'] ?? 0);
        if (!$nama || !$harga) { echo json_encode(["success"=>false,"message"=>"Nama & harga wajib"]); break; }
        $db->prepare("INSERT INTO menu (nama_menu,harga,id_kategori,deskripsi,stok) VALUES(?,?,?,?,?)")
           ->execute([$nama,$harga,$input['id_kategori']??null,trim($input['deskripsi']??''),$input['stok']??'Tersedia']);
        echo json_encode(["success"=>true,"message"=>"Menu ditambahkan"]);
        break;

    case 'PUT':
        $id = (int)($input['id_menu'] ?? 0);
        if (!$id) { echo json_encode(["success"=>false,"message"=>"ID tidak ada"]); break; }
        $db->prepare("UPDATE menu SET nama_menu=?,harga=?,id_kategori=?,deskripsi=?,stok=? WHERE id_menu=?")
           ->execute([trim($input['nama_menu']??''),floatval($input['harga']??0),$input['id_kategori']??null,
                      trim($input['deskripsi']??''),$input['stok']??'Tersedia',$id]);
        echo json_encode(["success"=>true,"message"=>"Menu diupdate"]);
        break;

    case 'DELETE':
        $id = (int)($_GET['id'] ?? 0);
        if (!$id) { echo json_encode(["success"=>false,"message"=>"ID tidak ada"]); break; }
        $db->prepare("DELETE FROM menu WHERE id_menu=?")->execute([$id]);
        echo json_encode(["success"=>true,"message"=>"Menu dihapus"]);
        break;

    default:
        echo json_encode(["success"=>false,"message"=>"Method tidak diizinkan"]);
}
