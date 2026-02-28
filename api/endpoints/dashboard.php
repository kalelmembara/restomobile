<?php
require_once '../config/database.php';
$db = getDB();

$totalMenu      = $db->query("SELECT COUNT(*) FROM menu")->fetchColumn();
$totalKategori  = $db->query("SELECT COUNT(*) FROM kategori")->fetchColumn();
$totalMeja      = $db->query("SELECT COUNT(*) FROM meja")->fetchColumn();
$mejaTersedia   = $db->query("SELECT COUNT(*) FROM meja WHERE status='Tersedia'")->fetchColumn();
$totalTrx       = $db->query("SELECT COUNT(*) FROM transaksi")->fetchColumn();
$pendapatanHari = $db->query("SELECT COALESCE(SUM(total_harga),0) FROM transaksi WHERE DATE(tanggal)=CURDATE()")->fetchColumn();
$pendapatanBulan= $db->query("SELECT COALESCE(SUM(total_harga),0) FROM transaksi WHERE MONTH(tanggal)=MONTH(CURDATE()) AND YEAR(tanggal)=YEAR(CURDATE())")->fetchColumn();
$dinein         = $db->query("SELECT COUNT(*) FROM transaksi WHERE tipe_order='dinein'")->fetchColumn();
$takeaway       = $db->query("SELECT COUNT(*) FROM transaksi WHERE tipe_order='takeaway'")->fetchColumn();

// 7 transaksi terakhir
$lastTrx = $db->query("SELECT id_transaksi, total_harga, kode_meja, tipe_order, tanggal FROM transaksi ORDER BY tanggal DESC LIMIT 7")->fetchAll();

echo json_encode([
    "success" => true,
    "data" => [
        "total_menu"        => (int)$totalMenu,
        "total_kategori"    => (int)$totalKategori,
        "total_meja"        => (int)$totalMeja,
        "meja_tersedia"     => (int)$mejaTersedia,
        "total_transaksi"   => (int)$totalTrx,
        "pendapatan_hari"   => (float)$pendapatanHari,
        "pendapatan_bulan"  => (float)$pendapatanBulan,
        "trx_dinein"        => (int)$dinein,
        "trx_takeaway"      => (int)$takeaway,
        "transaksi_terakhir"=> $lastTrx,
    ]
]);
