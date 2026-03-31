# ═══════════════════════════════════════════════════════════════
#  start-backend.ps1
#  Script otomatis untuk menjalankan backend RestoApp
#  Database: Laragon MySQL (port 3306)
#
#  Cara pakai:
#    Klik-kanan → Run with PowerShell
#    ATAU di terminal: .\start-backend.ps1
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   RestoApp Backend Startup Script        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Pindah ke folder backend
$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Folder backend tidak ditemukan di: $backendPath" -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar"
    exit 1
}
Set-Location $backendPath
Write-Host "📁 Folder  : $backendPath" -ForegroundColor Gray

# Cek node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Menginstall dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install gagal!" -ForegroundColor Red
        Read-Host "Tekan Enter untuk keluar"
        exit 1
    }
    Write-Host "✅ Dependencies terinstall" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies  : OK (node_modules ada)" -ForegroundColor Green
}

# Cek MySQL berjalan (coba koneksi port 3306)
Write-Host ""
Write-Host "🔍 Mengecek MySQL (port 3306)..." -ForegroundColor Yellow
$mysqlRunning = $false
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $tcp.Connect("localhost", 3306)
    $tcp.Close()
    $mysqlRunning = $true
} catch {}

if ($mysqlRunning) {
    Write-Host "✅ MySQL         : BERJALAN di port 3306" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "🔴 MySQL TIDAK berjalan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Silakan:" -ForegroundColor Yellow
    Write-Host "   1. Buka Laragon" -ForegroundColor White
    Write-Host "   2. Klik tombol [Start All] atau Start MySQL" -ForegroundColor White
    Write-Host "   3. Pastikan lampu MySQL berwarna hijau" -ForegroundColor White
    Write-Host "   4. Jalankan script ini lagi" -ForegroundColor White
    Write-Host ""
    Read-Host "Tekan Enter setelah MySQL dinyalakan"

    # Cek ulang
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("localhost", 3306)
        $tcp.Close()
        Write-Host "✅ MySQL sekarang berjalan!" -ForegroundColor Green
    } catch {
        Write-Host "❌ MySQL masih tidak berjalan. Harap nyalakan dulu." -ForegroundColor Red
        Read-Host "Tekan Enter untuk keluar"
        exit 1
    }
}

# Setup database (buat tabel + data jika belum ada)
Write-Host ""
Write-Host "🗄️  Menyiapkan database db_resto..." -ForegroundColor Yellow
node setup-database.js
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "⚠️  Setup database ada masalah, cek output di atas." -ForegroundColor Yellow
    Write-Host "   Backend tetap akan dicoba dijalankan..." -ForegroundColor Gray
}

# Jalankan server
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 Menjalankan Backend..." -ForegroundColor Cyan
Write-Host "  Tekan Ctrl+C untuk menghentikan server" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

node server.js
