<?php
require_once '../config/database.php';
$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents("php://input"), true) ?? [];
$db     = getDB();

switch ($method) {
    case 'GET':
        $limit = (int)($_GET['limit'] ?? 50);
        $stmt  = $db->prepare("SELECT * FROM transaksi ORDER BY tanggal DESC LIMIT ?");
        $stmt->execute([$limit]);
        $list = $stmt->fetchAll();
        foreach ($list as &$trx) {
            $s = $db->prepare("SELECT * FROM detail_transaksi WHERE id_transaksi=?");
            $s->execute([$trx['id_transaksi']]);
            $trx['detail'] = $s->fetchAll();
        }
        echo json_encode(["success"=>true,"data"=>$list]);
        break;

    case 'POST':
        $items      = $input['items']      ?? [];
        $uang_bayar = floatval($input['uang_bayar'] ?? 0);
        $kode_meja  = trim($input['kode_meja']  ?? '-');
        $tipe_order = trim($input['tipe_order'] ?? 'dinein');

        if (empty($items)) { echo json_encode(["success"=>false,"message"=>"Tidak ada item"]); break; }

        $total = 0;
        foreach ($items as $item) $total += floatval($item['harga']) * intval($item['jumlah']);

        $kembalian = $uang_bayar - $total;
        if ($kembalian < 0) { echo json_encode(["success"=>false,"message"=>"Uang bayar kurang"]); break; }

        $db->beginTransaction();
        try {
            $db->prepare("INSERT INTO transaksi (total_harga,uang_bayar,kembalian,kode_meja,tipe_order) VALUES(?,?,?,?,?)")
               ->execute([$total,$uang_bayar,$kembalian,$kode_meja,$tipe_order]);
            $id = $db->lastInsertId();

            foreach ($items as $item) {
                $sub = floatval($item['harga']) * intval($item['jumlah']);
                $db->prepare("INSERT INTO detail_transaksi (id_transaksi,nama_menu,harga,jumlah,subtotal) VALUES(?,?,?,?,?)")
                   ->execute([$id,$item['nama_menu'],$item['harga'],$item['jumlah'],$sub]);
            }

            // Jika dinein, update status meja jadi Tersedia setelah bayar
            if ($tipe_order === 'dinein' && $kode_meja !== '-') {
                $db->prepare("UPDATE meja SET status='Tersedia' WHERE kode_meja=?")->execute([$kode_meja]);
            }

            $db->commit();
            echo json_encode([
                "success"=>true,"message"=>"Transaksi berhasil",
                "data"=>["id_transaksi"=>$id,"total_harga"=>$total,"uang_bayar"=>$uang_bayar,"kembalian"=>$kembalian]
            ]);
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(["success"=>false,"message"=>"Gagal: ".$e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["success"=>false,"message"=>"Method tidak diizinkan"]);
}
