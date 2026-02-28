-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 28, 2026 at 08:56 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_resto`
--

-- --------------------------------------------------------

--
-- Table structure for table `detail_pesanan`
--

CREATE TABLE `detail_pesanan` (
  `id_detail` int NOT NULL,
  `id_pesanan` int DEFAULT NULL,
  `nama_menu` varchar(150) DEFAULT NULL,
  `harga` double DEFAULT NULL,
  `jumlah` int DEFAULT NULL,
  `subtotal` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `detail_pesanan`
--

INSERT INTO `detail_pesanan` (`id_detail`, `id_pesanan`, `nama_menu`, `harga`, `jumlah`, `subtotal`) VALUES
(1, 1, 'Nasi Goreng', 25000, 1, 25000),
(2, 1, 'Es Teh Manis', 8000, 1, 8000),
(3, 2, 'Nasi Goreng', 25000, 1, 25000),
(4, 3, 'Nasi Goreng', 25000, 1, 25000),
(5, 3, 'Es Teh Manis', 8000, 1, 8000),
(6, 3, 'Es Campur', 18000, 1, 18000);

-- --------------------------------------------------------

--
-- Table structure for table `detail_transaksi`
--

CREATE TABLE `detail_transaksi` (
  `id_detail` int NOT NULL,
  `id_transaksi` int DEFAULT NULL,
  `nama_menu` varchar(150) DEFAULT NULL,
  `harga` double DEFAULT NULL,
  `jumlah` int DEFAULT NULL,
  `subtotal` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `detail_transaksi`
--

INSERT INTO `detail_transaksi` (`id_detail`, `id_transaksi`, `nama_menu`, `harga`, `jumlah`, `subtotal`) VALUES
(44, 19, 'Ayam Ganja', 15000, 1, 15000),
(45, 19, 'Es Teh Manis', 8000, 1, 8000),
(46, 19, 'Keripik Singkong', 15000, 1, 15000),
(47, 20, 'Jasuke', 8000, 1, 8000),
(48, 21, 'Nasi Goreng', 25000, 1, 25000),
(49, 21, 'Ayam Bakar', 35000, 1, 35000),
(50, 21, 'Es Jeruk', 5000, 1, 5000),
(51, 22, 'Es Teh Manis', 8000, 1, 8000),
(52, 23, 'Nasi Goreng', 25000, 1, 25000),
(53, 23, 'Puding', 10000, 1, 10000),
(54, 24, 'Ayam Bakar', 35000, 1, 35000);

-- --------------------------------------------------------

--
-- Table structure for table `karyawan`
--

CREATE TABLE `karyawan` (
  `id_karyawan` int NOT NULL,
  `nama` varchar(150) DEFAULT NULL,
  `jabatan` varchar(100) DEFAULT NULL,
  `no_telp` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` int NOT NULL,
  `nama_kategori` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Makanan'),
(2, 'Minuman'),
(3, 'Dessert'),
(4, 'Snack');

-- --------------------------------------------------------

--
-- Table structure for table `meja`
--

CREATE TABLE `meja` (
  `id_meja` int NOT NULL,
  `kode_meja` varchar(20) NOT NULL,
  `kapasitas` int DEFAULT '4',
  `status` enum('Tersedia','Terisi') DEFAULT 'Tersedia'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `meja`
--

INSERT INTO `meja` (`id_meja`, `kode_meja`, `kapasitas`, `status`) VALUES
(1, 'M-01', 4, 'Terisi'),
(2, 'M-02', 4, 'Terisi'),
(7, 'M-03', 4, 'Tersedia'),
(8, 'M-04', 4, 'Terisi'),
(9, 'M-05', 8, 'Terisi'),
(10, 'M-06', 8, 'Tersedia'),
(11, 'M-07', 2, 'Tersedia'),
(12, 'M-08', 2, 'Tersedia'),
(13, 'M-09', 2, 'Terisi'),
(14, 'M-10', 2, 'Terisi'),
(15, 'M-11', 2, 'Terisi');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id_menu` int NOT NULL,
  `nama_menu` varchar(150) NOT NULL,
  `harga` double NOT NULL,
  `id_kategori` int DEFAULT NULL,
  `deskripsi` text,
  `stok` enum('Tersedia','Tidak Tersedia') NOT NULL DEFAULT 'Tersedia'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id_menu`, `nama_menu`, `harga`, `id_kategori`, `deskripsi`, `stok`) VALUES
(1, 'Nasi Goreng', 25000, 1, 'Nasi goreng spesial dengan telur', 'Tersedia'),
(2, 'Mie Goreng', 22000, 1, 'Mie goreng dengan sayuran', 'Tidak Tersedia'),
(3, 'Ayam Bakar', 35000, 1, 'Ayam bakar bumbu kecap', 'Tersedia'),
(4, 'Es Teh Manis', 8000, 2, 'Teh manis dingin', 'Tersedia'),
(9, 'Ayam Ganja', 15000, 1, 'Ayam Ganja dengan sambal rempah dan kangkung goreng', 'Tersedia'),
(10, 'Es Jeruk', 5000, 2, 'es jeruk manis', 'Tersedia'),
(11, 'Es Kelapa', 10000, 2, 'es kelapa muda', 'Tidak Tersedia'),
(12, 'Puding', 10000, 3, 'enak lembut', 'Tersedia'),
(13, 'Jasuke', 8000, 3, 'enak', 'Tersedia'),
(14, 'Cheesecake', 15000, 3, 'enak', 'Tersedia'),
(16, 'Es Strup', 5000, 2, 'enak', 'Tersedia'),
(17, 'Popcorn', 15000, 4, 'enak', 'Tersedia'),
(18, 'Makaroni', 10000, 4, 'enak', 'Tidak Tersedia'),
(19, 'Keripik Singkong', 15000, 4, 'enak', 'Tersedia'),
(20, 'Basreng Pedas', 8000, 4, 'enak', 'Tersedia'),
(21, 'Salad Buah', 12000, 3, 'enak', 'Tersedia');

-- --------------------------------------------------------

--
-- Table structure for table `pesanan`
--

CREATE TABLE `pesanan` (
  `id_pesanan` int NOT NULL,
  `no_meja` varchar(20) DEFAULT NULL,
  `total_harga` double DEFAULT '0',
  `status` enum('menunggu','diproses','selesai','batal') DEFAULT 'menunggu',
  `waktu_pesan` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pesanan`
--

INSERT INTO `pesanan` (`id_pesanan`, `no_meja`, `total_harga`, `status`, `waktu_pesan`) VALUES
(1, 'M-01', 33000, 'selesai', '2026-02-27 22:35:33'),
(2, 'm-05', 25000, 'batal', '2026-02-27 22:37:55'),
(3, 'M-01', 51000, 'selesai', '2026-02-27 22:56:56');

-- --------------------------------------------------------

--
-- Table structure for table `transaksi`
--

CREATE TABLE `transaksi` (
  `id_transaksi` int NOT NULL,
  `total_harga` double DEFAULT NULL,
  `uang_bayar` double DEFAULT NULL,
  `kembalian` double DEFAULT NULL,
  `tanggal` datetime DEFAULT CURRENT_TIMESTAMP,
  `kode_meja` varchar(20) DEFAULT '-',
  `tipe_order` varchar(20) DEFAULT '-'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `transaksi`
--

INSERT INTO `transaksi` (`id_transaksi`, `total_harga`, `uang_bayar`, `kembalian`, `tanggal`, `kode_meja`, `tipe_order`) VALUES
(19, 38000, 5555555, 5517555, '2026-02-28 02:46:13', 'M-01', 'dinein'),
(20, 8000, 0, 0, '2026-02-28 03:15:53', '-', 'takeaway'),
(21, 65000, 0, 0, '2026-02-28 13:52:42', 'M-02', 'dinein'),
(22, 8000, 0, 0, '2026-02-28 13:53:22', 'M-04', 'dinein'),
(23, 35000, 0, 0, '2026-02-28 14:52:24', 'M-05', 'dinein'),
(24, 35000, 0, 0, '2026-02-28 15:00:43', '-', 'takeaway');

-- --------------------------------------------------------

--
-- Table structure for table `update_stokharian`
--

CREATE TABLE `update_stokharian` (
  `id_stok` int NOT NULL,
  `id_menu` int DEFAULT NULL,
  `stok` int DEFAULT '0',
  `tanggal` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','kasir','pelayan') DEFAULT 'kasir',
  `status` enum('aktif','nonaktif') DEFAULT 'aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `username`, `email`, `password`, `role`, `status`) VALUES
(1, 'admin', 'admin@restoran.com', 'admin123', 'admin', 'aktif'),
(2, 'kasir1', 'kasir@restoran.com', 'kasir123', 'kasir', 'aktif'),
(3, 'budi', 'budi@gmail.com', 'budi123', 'admin', 'aktif');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `id_pesanan` (`id_pesanan`);

--
-- Indexes for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `id_transaksi` (`id_transaksi`);

--
-- Indexes for table `karyawan`
--
ALTER TABLE `karyawan`
  ADD PRIMARY KEY (`id_karyawan`);

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`);

--
-- Indexes for table `meja`
--
ALTER TABLE `meja`
  ADD PRIMARY KEY (`id_meja`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id_menu`),
  ADD KEY `id_kategori` (`id_kategori`);

--
-- Indexes for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id_pesanan`);

--
-- Indexes for table `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id_transaksi`);

--
-- Indexes for table `update_stokharian`
--
ALTER TABLE `update_stokharian`
  ADD PRIMARY KEY (`id_stok`),
  ADD KEY `id_menu` (`id_menu`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  MODIFY `id_detail` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  MODIFY `id_detail` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `karyawan`
--
ALTER TABLE `karyawan`
  MODIFY `id_karyawan` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `meja`
--
ALTER TABLE `meja`
  MODIFY `id_meja` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id_menu` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `pesanan`
--
ALTER TABLE `pesanan`
  MODIFY `id_pesanan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id_transaksi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `update_stokharian`
--
ALTER TABLE `update_stokharian`
  MODIFY `id_stok` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD CONSTRAINT `detail_pesanan_ibfk_1` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan` (`id_pesanan`) ON DELETE CASCADE;

--
-- Constraints for table `detail_transaksi`
--
ALTER TABLE `detail_transaksi`
  ADD CONSTRAINT `detail_transaksi_ibfk_1` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi` (`id_transaksi`) ON DELETE CASCADE;

--
-- Constraints for table `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE SET NULL;

--
-- Constraints for table `update_stokharian`
--
ALTER TABLE `update_stokharian`
  ADD CONSTRAINT `update_stokharian_ibfk_1` FOREIGN KEY (`id_menu`) REFERENCES `menu` (`id_menu`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
