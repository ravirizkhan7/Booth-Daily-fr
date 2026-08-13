# Booth Daily

**Booth Daily** adalah Web-based Point of Sale (POS) modern, ringan, dan responsif yang dirancang khusus untuk memenuhi kebutuhan operasional harian *coffee shop* maupun usaha kecil lainnya. 

Sistem ini dibuat dengan prinsip *Clean Code*, kesederhanaan *User Experience* (UX), dan arsitektur yang solid agar mudah dikembangkan dan dihubungkan ke backend (API) di masa mendatang.

## Fitur Utama

- **Kasir (POS)**: Sistem transaksi cepat dengan manajemen keranjang dan pembayaran.
- **Produk**: Pengelolaan menu, variasi, dan harga jual.
- **Kategori**: Manajemen kategori produk untuk kemudahan pencarian menu.
- **Resep**: Integrasi produk dengan bahan baku (HPP dan kalkulasi otomatis).
- **Stock (Inventory)**: Pemantauan stok bahan baku dan peringatan stok menipis.
- **Pembelian**: Pencatatan pembelian bahan baku dari *supplier*.
- **Riwayat Transaksi**: Detail laporan penjualan beserta metode pembayaran.
- **Dashboard**: Ringkasan performa penjualan dan wawasan bisnis.
- **Laporan**: Ringkasan harian dan bulanan penjualan, pajak, dan pengeluaran.
- **Karyawan**: Pengelolaan hak akses dan peran (Owner, Karyawan, Guest).
- **Pengaturan**: Konfigurasi umum toko (diskon otomatis, pajak, profil).

## Tech Stack

Proyek ini dibangun menggunakan teknologi terkini di ekosistem frontend:

*   **Frontend Library**: React ^19.0.1
*   **Language**: TypeScript ~5.8.2
*   **Build Tool**: Vite ^6.2.3
*   **Routing**: React Router DOM ^7.18.2
*   **Styling**: Tailwind CSS ^4.1.14
*   **Icons**: Lucide React ^0.546.0
*   **Animations**: Motion ^12.23.24
*   **API Client**: Axios ^1.19.0
*   **Node.js**: Backend server Express (opsional, disiapkan melalui `express` ^4.21.2)

## Installation

Pastikan [Node.js](https://nodejs.org/) terpasang di sistem Anda.
Disarankan menggunakan versi terbaru yang stabil.

1.  **Clone repository** (jika ada):
    ```bash
    git clone <repository_url>
    cd <project_folder>
    ```

2.  **Install dependency**:
    ```bash
    npm install
    ```

3.  **Jalankan development server**:
    ```bash
    npm run dev
    ```
    Server akan berjalan secara default di `http://localhost:3000`.

4.  **Build production**:
    ```bash
    npm run build
    ```

5.  **Preview hasil build**:
    ```bash
    npm run preview
    ```

## Project Structure

Aplikasi ini menggunakan struktur folder terpusat (Modular Architecture) di dalam direktori `src/`:

```
src/
├── assets/          # Berkas statis (gambar, font, ikon khusus)
├── components/      # UI component yang dapat digunakan ulang (reusable)
│   ├── common/      # Component umum (Modal, Input, Dialog, Toast, Logo)
│   ├── layout/      # Kepingan Layout (, Sidebar, dsb)
│   └── pos/         # Component khusus POS (ProductCard, CartSidebar, CategoryBar)
├── context/         # React Context API (State Management utama seperti POSContext)
├── data/            # Data dummy sementara untuk kebutuhan development frontend
├── hooks/           # Custom React hooks
├── layouts/         # Layout halaman (MainLayout)
├── pages/           # Halaman utama aplikasi (POSPage, InventoryPage, DashboardPage, dll)
├── services/        # Service layer untuk memproses logic API / interaksi Backend
├── types/           # Deklarasi TypeScript interface & global types (Models)
├── utils/           # Fungsi utilitas (Formatters, Stock Kalkulator)
├── App.tsx          # Komponen root aplikasi & Setup React Router
└── main.tsx         # Entry point React
```

## Data Dummy

Saat ini, project masih berada di fase pengembangan *Frontend-Only* dan belum terhubung secara penuh ke Backend API. Kami menggunakan data statis sementara (Dummy Data) untuk mensimulasikan operasional aplikasi.

*   **File**: `src/data/dummy.tsx`
*   **Fungsi**: Berisi *seed data* seperti Produk, Kategori, Bahan Baku (Stok), Riwayat Transaksi, Pembelian, Resep, Karyawan, dan Setup Aplikasi.
*   **Implementasi**: Setiap kali layer aplikasi melakukan "fetch" atau "update", perubahan sementara akan dicatat di _memory_, sehingga refresh browser akan mereset data. Di masa depan, data ini akan dihapus dan diganti sepenuhnya dengan pemanggilan Backend API.

## API Architecture

Aplikasi ini dipersiapkan dengan **Service Layer** agar logic interaksi HTTP terpisah dari UI Components. Pendekatan ini membuat aplikasi jauh lebih bersih (Clean Code) dan *maintainable*. 

```
src/services/
├── orderService.ts       # Service untuk proses checkout dan pencatatan transaksi
├── productService.ts     # Service CRUD produk dan kategori
├── recipeService.ts      # Service untuk manajemen resep (bahan baku ke produk)
├── stockService.ts       # Service CRUD master stok dan log penyesuaian stok
├── transactionService.ts # Service untuk pengambilan dan refund riwayat order
└── userService.ts        # Service manajemen autentikasi & profil karyawan
```

**Aturan Integrasi API**:
*   *Component UI* (seperti halaman atau tombol) **TIDAK BOLEH** langsung memanggil `axios` atau `fetch`.
*   *Component UI* hanya memanggil fungsi di dalam *Service Layer*.
*   Ketika Endpoint / Logic dari Backend berubah, perbaikan hanya perlu dilakukan di *Service Layer* tanpa harus mengubah ratusan baris kode pada *UI Components*.

## Backend Integration Roadmap (Laravel 13)

Aplikasi Frontend React ini ke depannya akan dihubungkan ke backend yang dibangun menggunakan **Laravel 13**.

*   **Tanggung Jawab Backend (Laravel 13):**
    *   Authentication & Authorization (Token/Session, Role & Permissions).
    *   Manajemen Database (PostgreSQL / MySQL).
    *   Validasi Transaksi dan Logic Bisnis.
    *   Perhitungan stok, modal, harga jual, dan laba yang lebih mutlak & konsisten.
    *   Generasi laporan PDF / Excel.
*   **Tanggung Jawab Frontend (React):**
    *   Mengatur User Interface dan Experience.
    *   State Management UI (Form inputs, cart items).
    *   Konsumsi API (GET, POST, PUT, DELETE).
    *   Presentasi laporan melalui Chart atau Table.

## Environment Variables

Terdapat file `.env.example` yang menyediakan variabel *environment* yang dibutuhkan.

*   `VITE_API_URL`
    Menyimpan URL Backend API. Penggunaan: `import.meta.env.VITE_API_URL`. Jangan melakukan *hardcode* `http://localhost:8000/api` di dalam kode.
    
Ketika backend siap, Anda perlu membuat file `.env` dan mengisi variabel tersebut.

## Types / Interfaces

Frontend menggunakan TypeScript untuk menjamin integritas struktur data. Interface ini berfungsi sebagai kontrak data antara *Frontend* dan *Backend API*. 

Seluruh type diletakkan pada:
*   `src/types/index.ts`

Interface Utama yang harus selalu sinkron dengan Backend:
*   `Product`, `Category`, `Recipe`, `RecipeIngredient`
*   `Stock`, `Purchase`, `PurchaseItem`, `Transaction`, `OrderItem`
*   `User`, `Report`, `PaymentMethod`

## Authentication

Proses *Authentication* dan pembatasan akses (*Role-Based Access Control*) disiapkan di dalam UI. Namun **pengamanan mutlak harus berada di sisi Backend**.

**Role Sistem**:
1.  **Guest (Kasir Langsung)**
    *   Mengakses halaman POS Kasir dan halaman Resep.
2.  **Karyawan**
    *   Mengakses POS Kasir, Resep.
    *   Dapat melihat riwayat stok (Read-Only) dan riwayat transaksi.
3.  **Owner**
    *   Akses mutlak untuk seluruh manajemen (*Dashboard*, Manajemen Karyawan, Pembelian, Laporan Penjualan, Penghapusan Produk/Transaksi).

## Security Guidelines

-   **Frontend Bukan Tempat Secret**: Private key, secret tokens, database credentials, atau API secrets tidak akan pernah disimpan di frontend.
-   **Validasi UI Bukan Security**: Jika tombol `Delete` disembunyikan bagi `Karyawan`, itu murni untuk User Experience. Backend (Laravel) harus tetap menolak aksi DELETE apabila token tidak memiliki Role/Izin yang sesuai.
-   **Secure HTML Render**: Mencegah *Cross-Site Scripting* (XSS) dengan tidak menggunakan metode berbahaya seperti `dangerouslySetInnerHTML` kecuali telah melalui proses sanitasi yang aman.

## Performance Guidelines

Untuk memastikan aplikasi tetap sangat cepat dan ringan (bahkan pada perangkat tablet kasir spesifikasi rendah):
1.  **Efficient State Management**: Menghindari *re-render* secara berlebihan dengan tidak menempatkan *heavy computation* ke dalam logic komponen tanpa memoization (`useMemo`, `useCallback`).
2.  **Reusable Components**: Logic dan view yang diulang harus diekstrak sebagai komponen.
3.  **Minimal Dependencies**: Tidak menginstal package npm baru kecuali jika benar-benar krusial, prioritas menggunakan fungsi bawaan (*Native*) dan utility class (Tailwind).
4.  **Image Optimization**: Kompresi aset gambar sangat direkomendasikan.

## Development Guideline (Cara Menambahkan Fitur Baru)

Jika Anda ingin menambahkan halaman atau fitur baru (Misal: Modul "Diskon/Voucher"):
1.  **Update Interface**: Tambahkan kontrak data `Voucher` di `src/types/index.ts`.
2.  **Tambahkan API Service**: Buat `voucherService.ts` di folder `services` untuk menampung method GET, POST, PUT, DELETE voucher.
3.  **Buat Reusable Component (Opsional)**: Buat komponen formulir `VoucherForm.tsx` di `components/`.
4.  **Buat Page**: Buat file utama `VoucherPage.tsx` di `pages/` (menggunakan service untuk request data).
5.  **Setup Routing**: Daftarkan path `VoucherPage` di `src/App.tsx`.
6.  **Update README (Jika struktur/konsep bertambah)**.

## Database (Konseptual)

Berikut adalah gambaran relasi entitas/database yang akan dikelola oleh backend:
-   `Users` (Autentikasi Karyawan & Owner)
-   `Categories` (Pengelompokan Produk)
-   `Products` (Daftar Menu Kopi, Makanan)
-   `Recipes` & `Recipe_Ingredients` (Penghubung antara Produk dengan Stok Bahan Baku)
-   `Stocks` (Master Inventory Bahan Baku)
-   `Stock_Histories` (Catatan Keluar-Masuk Stok)
-   `Purchases` & `Purchase_Items` (Nota Belanja & Rincian Barang Masuk)
-   `Transactions` / `Orders` & `Order_Items` (Nota Penjualan & Rincian Pesanan)

## Current Status

*   **Frontend**: Development Phase (UI/UX 100% Ready)
*   **Data**: *Dummy Data / Local State*
*   **Backend**: Belum terhubung (Ready for Laravel API Integration)
*   **Database**: Menunggu Backend
*   **Authentication**: Frontend UI (Pending Backend Token Integration)

## Troubleshooting

-   **Missing Dependencies / Build Error**: Jalankan perintah `rm -rf node_modules && npm install` untuk membersihkan cache installasi.
-   **Port 3000 Bentrok**: Proses Node lain mungkin masih berjalan, tutup atau matikan proses pada port 3000 terlebih dahulu.
-   **Tailwind Styles Tidak Muncul**: Pastikan file yang mengandung class berada di direktori `src/` dan terekam oleh engine bundler Vite.

## Export & Document Generation

Sistem aplikasi ini tidak menggunakan *browser native print* (`window.print()`) untuk menghindari ketergantungan pada CSS dan memberikan hasil yang selalu profesional serta terstruktur. 

Semua hasil cetak dibuat secara programmatic melalui service berikut:
- **PDF Export**: Menggunakan `jspdf` dan `jspdf-autotable` untuk mengonversi data menjadi dokumen PDF yang rapi (termasuk Invoice/Nota dan Laporan Transaksi).
- **Excel Export**: Menggunakan `xlsx` untuk mengonversi data JSON menjadi file Excel bersheet (spreadsheet) yang siap diolah.

### Instalasi Dependency

```bash
npm install jspdf jspdf-autotable xlsx
```

### Struktur Folder Export

```
src/
 ├── services/
 │    ├── pdfExport.ts      # Service untuk build dan styling PDF dokumen
 │    └── excelExport.ts    # Service untuk export array data ke Excel (.xlsx)
```

### Cara Kerja Export PDF & Excel

1. **User membuka Laporan/Kasir**
2. **User memilih opsi Cetak PDF / Export Excel**
3. **Data dikirim ke Service Helper**
4. **Service Helper mengonversi data ke format file yang dituju**
5. **File otomatis terunduh di perangkat User**

## Development Notes

Bagi developer yang akan melanjutkan project ini, mohon ikuti panduan berikut:
- **DILARANG** menggunakan `window.print()` atau CSS `@media print`.
- Semua modul yang membutuhkan fitur cetak, print, laporan, invoice, nota, atau histori WAJIB menggunakan fungsi dari helper `pdfExport.ts` atau `excelExport.ts`.
- Hindari duplikasi logic export. Jika membutuhkan template baru (misal Invoice A4), tambahkan function baru di `pdfExport.ts`.

## Project Maintenance

**Struktur Project Terbaru**
- `src/` - Berisi seluruh source code aplikasi (components, pages, services, context, hooks).
- `assets/` - Folder aset statis.
- `public/` - Folder publik untuk aset statis (jika ada).
- Konfigurasi inti: `package.json`, `vite.config.ts`, `tsconfig.json`, `.gitignore`, `metadata.json`, `index.html`.

**File Penting**
- `src/main.tsx` - Entry point React.
- `src/App.tsx` - Konfigurasi Routing.
- `src/context/POSContext.tsx` - Global State Management.
- `src/services/` - Kumpulan API/Logic Services untuk PDF, Excel, dll.

**File yang Sudah Dibersihkan (Audit per Agustus 2026)**
- Script temporary hasil AI generation (`lint_check.cjs`, `update_hidden_block.cjs`, `update_readme.cjs`, `update_reports.cjs`).
- File temporary text (`temp.txt`).
- Dependency yang tidak digunakan (`motion`).

**Cara Menjalankan Project**
1. Install dependencies: \`npm install\`
2. Jalankan server development: \`npm run dev\`
3. Build untuk production: \`npm run build\`

## Printing & Export Architecture

Sistem pencetakan dan export pada aplikasi telah dipisahkan untuk menjamin performa dan kualitas hasil dokumen:

### Receipt Printing
Pencetakan struk transaksi dirancang khusus untuk **Printer Thermal** dengan arsitektur terisolasi (tanpa PDF).
\`\`\`
Transaction
↓
Receipt Print Service
↓
Isolated HTML/CSS
↓
Browser Print
↓
Thermal Printer
\`\`\`

### PDF Export
Export dokumen dan laporan ke format PDF menggunakan jsPDF.
\`\`\`
Application Data
↓
jsPDF + autoTable
↓
PDF
\`\`\`

### Excel Export
Export data mentah (CSV/Excel) menggunakan XLSX.
\`\`\`
Application Data
↓
XLSX
↓
Excel
\`\`\`

## Test Printer
- Test Print tersedia untuk Guest, Karyawan, dan Owner di menu Pengaturan.
- Test Print **tidak** menggunakan PDF.
- Test Print menggunakan *Receipt Print Service* dengan HTML/CSS terisolasi.
- Test Print digunakan untuk menguji apakah printer kasir/thermal dapat mencetak struk dengan baik.

## Transaction PIN Security
Sistem keamanan otorisasi transaksi dengan PIN telah di-hardened:
- **Login/session** dan **PIN transaksi** adalah dua mekanisme berbeda.
- PIN transaksi tidak pernah mengganti role/session pengguna yang sedang aktif.
- Guest akan tetap menjadi Guest setelah menyelesaikan transaksi.
- User yang sedang login (Karyawan/Owner) tidak dapat menggunakan PIN akun lain untuk mengganti akun atau mengotorisasi transaksi mereka.
- Pesan error ketika "PIN salah" bersifat generik untuk mencegah serangan *PIN enumeration* dan menjaga privasi pengguna.

## System Audit

Tanggal audit: 2026-08-10

## Security

Sistem otorisasi PIN telah melalui security review dan dinyatakan aman dari kerentanan *Session Hijacking* maupun *Privilege Escalation*. 
- PIN transaksi dipisahkan secara ketat dari Session Login.
- *PIN enumeration* dicegah dengan menggunakan pesan kesalahan generik.
- Guest dapat melakukan transaksi tanpa mengubah state aplikasinya menjadi Karyawan atau Owner.
- Karyawan dan Owner hanya dapat menggunakan PIN milik mereka sendiri untuk transaksi yang mereka lakukan.

## Testing

Pengujian fungsional dan keamanan meliputi:
- **Role Isolation Testing**: Karyawan/Owner tidak bisa login sebagai akun lain melalui PIN transaksi (PASS).
- **Guest Transaction**: Guest bisa bertransaksi dengan otorisasi tanpa terekspos ke dashboard Karyawan/Owner (PASS).
- **Print Module Testing**: *Receipt Print Service* berhasil merender struk tanpa intervensi layout aplikasi global, PDF berjalan untuk dokumen A4, Excel dapat diekspor (PASS).
- **Build & Linting**: *Zero-error* pada saat TypeScript compilation (PASS).

## Printing Architecture

Dokumentasi arsitektur pencetakan yang telah di-hardening:

- **Struk Kasir (Thermal Printer)**:
  Receipt Print Service → Isolated HTML/CSS → Browser Print

- **Laporan Dokumen (A4)**:
  jsPDF + autoTable

- **Laporan Mentah (Spreadsheet)**:
  XLSX

## Maintenance Notes

- **Struktur Service**: Semua layanan (seperti `receiptPrint.ts`, `pdfExport.ts`) harus tetap single-responsibility dan terisolasi. 
- **Aturan PIN**: `POSContext.tsx` tidak boleh merubah state `currentUser` saat verifikasi PIN transaksi selesai.
- **Aturan Print**: Jangan pernah merender UI Dashboard atau Navbar ke dalam komponen `receiptPrint.ts` (menggunakan tag terisolasi `<iframe>`).
- **Test Printer**: Disediakan khusus di halaman Settings bagi semua role (termasuk Guest) untuk validasi hardware tanpa menyimpan/membuat file PDF.


## Layout Architecture & Accessibility

Sistem layout telah di-refactor:
- **Component Isolation**: Pemisahan `Navbar.tsx`, `Sidebar.tsx`, `MobileMenu.tsx`, dan `MainLayout.tsx`.
- **Scrolling Behavior**: Menerapkan arsitektur layout dengan Fixed Navbar dan Sidebar, sehingga HANYA Main Content area yang dapat di-scroll (tidak terjadi double-scroll atau layout stretch).
- **Test Printer Access**: Tombol Test Printer diletakkan di sidebar untuk semua role (Guest, Karyawan, Owner) agar mudah diakses tanpa harus masuk ke menu Pengaturan.

