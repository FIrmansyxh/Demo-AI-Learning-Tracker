import { google } from 'googleapis';

interface TestCase {
  id: string;
  module: string;
  scenario: string;
  steps: string;
  expected: string;
  status: string;
  notes: string;
}

export async function createQASpreadsheet(accessToken: string): Promise<string> {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. Create a brand new spreadsheet
  const spreadsheetResponse = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: 'Modul Skenario QA - Dashboard Pembelajaran AI Karyawan',
      },
      sheets: [
        {
          properties: {
            title: '1. Ringkasan QA (Summary)',
            gridProperties: {
              rowCount: 30,
              columnCount: 10,
              frozenRowCount: 0,
            },
          },
        },
        {
          properties: {
            title: '2. Skenario Pengujian (Test Cases)',
            gridProperties: {
              rowCount: 150,
              columnCount: 8,
              frozenRowCount: 1,
            },
          },
        },
      ],
    },
  });

  const spreadsheetId = spreadsheetResponse.data.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error('Gagal membuat spreadsheet baru di Google Drive Anda.');
  }

  // 2. Prepare QA Test Cases
  const testCases: TestCase[] = [
    {
      id: 'TC-AUTH-01',
      module: 'Autentikasi & Multi-Role',
      scenario: 'Login Karyawan Biasa',
      steps: '1. Buka aplikasi\n2. Masukkan username "user" dan password "user" pada form login\n3. Klik tombol "Masuk"',
      expected: 'Pengguna berhasil masuk dan otomatis diarahkan ke Portal Karyawan (Tab Laporan Pembelajaran). Menu pemantauan kepatuhan admin dan manajemen karyawan tidak terlihat.',
      status: 'Belum Diuji',
      notes: 'Role terdeteksi sebagai "karyawan".'
    },
    {
      id: 'TC-AUTH-02',
      module: 'Autentikasi & Multi-Role',
      scenario: 'Login Administrator / Analis',
      steps: '1. Buka aplikasi\n2. Masukkan username "admin" dan password "admin" pada form login\n3. Klik tombol "Masuk"',
      expected: 'Pengguna berhasil masuk dan otomatis diarahkan ke Dashboard Analisis lengkap. Tab "Pemantauan Kepatuhan Laporan" & "Manajemen Karyawan" terlihat dan dapat diakses sepenuhnya.',
      status: 'Belum Diuji',
      notes: 'Role terdeteksi sebagai "admin".'
    },
    {
      id: 'TC-AUTH-03',
      module: 'Autentikasi & Multi-Role',
      scenario: 'Sesi Login Persisten (Auto-Login)',
      steps: '1. Lakukan login sukses\n2. Segarkan (Refresh/F5) halaman browser',
      expected: 'Sesi login tetap bertahan. Pengguna langsung masuk ke dashboard tanpa perlu mengulang input username & password.',
      status: 'Belum Diuji',
      notes: 'Sistem menggunakan state/storage untuk menyimpan sesi aktif.'
    },
    {
      id: 'TC-AUTH-04',
      module: 'Autentikasi & Multi-Role',
      scenario: 'Validasi Login Salah',
      steps: '1. Masukkan username sembarang "salahuser" dan password "salahpass"\n2. Klik "Masuk"',
      expected: 'Sistem menampilkan notifikasi error "Username atau password salah" dan menolak masuk ke dashboard.',
      status: 'Belum Diuji',
      notes: 'Sistem harus aman terhadap brute force sederhana.'
    },
    {
      id: 'TC-AUTH-05',
      module: 'Autentikasi & Multi-Role',
      scenario: 'Prosedur Keluar Akun (Logout)',
      steps: '1. Klik tombol "Logout" (Keluar) di pojok kanan atas aplikasi',
      expected: 'Pengguna langsung diarahkan kembali ke halaman Login. Sesi login dibersihkan secara total.',
      status: 'Belum Diuji',
      notes: 'Menghapus session token / local storage.'
    },
    {
      id: 'TC-EMP-01',
      module: 'Portal Karyawan - Form Laporan',
      scenario: 'Kirim Laporan Pembelajaran Baru (Sukses)',
      steps: '1. Di Tab "Laporan Pembelajaran", isi Form:\n   - Nama Fitur/Topik: "Otomatisasi Laporan Mingguan dengan Claude 3.5"\n   - AI yang Dipakai: "Claude"\n   - Deskripsi Singkat: "Menggunakan Claude API untuk parsing data"\n   - Estimasi Waktu Dihemat: "6"\n   - Poin Penting: "Kecepatan pengerjaan naik 60%"\n2. Klik "Kirim Laporan"',
      expected: 'Notifikasi toast "Laporan berhasil ditambahkan" muncul. Data baru langsung masuk di baris teratas tabel pribadi di bawah form.',
      status: 'Belum Diuji',
      notes: 'Data langsung memperbarui grafik lokal.'
    },
    {
      id: 'TC-EMP-02',
      module: 'Portal Karyawan - Form Laporan',
      scenario: 'Validasi Kolom Wajib Form',
      steps: '1. Kosongkan isian "Nama Fitur/Topik" di form\n2. Klik "Kirim Laporan"',
      expected: 'Muncul pesan validasi merah "Harap isi semua kolom wajib" dan data batal dikirim.',
      status: 'Belum Diuji',
      notes: 'Semua field wajib wajib terisi.'
    },
    {
      id: 'TC-EMP-03',
      module: 'Portal Karyawan - Form Laporan',
      scenario: 'Edit Laporan Pembelajaran',
      steps: '1. Cari laporan di tabel laporan pribadi\n2. Klik tombol "Edit" (ikon pensil)\n3. Ubah kolom "Estimasi Waktu Dihemat" menjadi "10"\n4. Klik "Simpan Perubahan"',
      expected: 'Data langsung terupdate di tabel menjadi "10 Jam" dan visual KPI memperhitungkan nilai baru.',
      status: 'Belum Diuji',
      notes: 'Tombol kirim berubah fungsi menjadi "Simpan Perubahan".'
    },
    {
      id: 'TC-EMP-04',
      module: 'Portal Karyawan - Form Laporan',
      scenario: 'Hapus Laporan Pembelajaran',
      steps: '1. Klik tombol "Hapus" (ikon sampah) di sebelah baris laporan\n2. Konfirmasi pop-up dialog penghapusan',
      expected: 'Laporan terhapus permanen dari tabel pribadi dan kalkulasi KPI dikurangi sesuai nilai laporan tersebut.',
      status: 'Belum Diuji',
      notes: 'Memicu alert konfirmasi konvensional yang aman.'
    },
    {
      id: 'TC-EMP-05',
      module: 'Portal Karyawan - List Laporan',
      scenario: 'Pencarian & Filter Laporan Pribadi',
      steps: '1. Ketik kata kunci "Claude" pada kotak pencarian di tabel pribadi\n2. Ganti opsi filter dropdown kategori tool AI',
      expected: 'Tabel hanya menyaring dan menampilkan baris laporan yang relevan dengan kata kunci atau filter tool AI terpilih.',
      status: 'Belum Diuji',
      notes: 'Pencarian bersifat case-insensitive.'
    },
    {
      id: 'TC-ART-01',
      module: 'Artikel Pembelajaran AI',
      scenario: 'Membaca Artikel Pembelajaran AI',
      steps: '1. Buka Tab "Artikel Pembelajaran"\n2. Pilih salah satu kartu artikel yang tersedia\n3. Klik "Baca Selengkapnya"',
      expected: 'Halaman beralih ke tampilan detail artikel secara penuh. Konten artikel yang ditulis dalam format Markdown dirender dengan rapi (tata letak, font, kutipan, tabel, & kode program terformat dengan baik).',
      status: 'Belum Diuji',
      notes: 'Menyediakan tombol "Kembali ke Daftar Artikel".'
    },
    {
      id: 'TC-ART-02',
      module: 'Artikel Pembelajaran AI',
      scenario: 'Cari dan Filter Artikel berdasarkan Kategori',
      steps: '1. Ketik kata "Gemini" pada kolom pencarian artikel\n2. Klik tab filter kategori "Tutorial Setup Skill"',
      expected: 'Daftar artikel langsung memfilter hasil secara dinamis hanya menampilkan artikel yang judulnya mengandung kata "Gemini" atau berada di kategori "Tutorial Setup Skill".',
      status: 'Belum Diuji',
      notes: 'Mendukung pencarian dinamis real-time.'
    },
    {
      id: 'TC-ART-03',
      module: 'Artikel Pembelajaran AI',
      scenario: 'Tambah Artikel Baru (Role Admin)',
      steps: '1. Login sebagai Admin\n2. Buka Tab "Artikel Pembelajaran"\n3. Klik tombol "Tambah Artikel Baru"\n4. Isi form tambah artikel:\n   - Judul: "Optimalisasi Prompt ChatGPT untuk Data Analyst"\n   - Kategori: "Update AI"\n   - URL Gambar Banner: "https://images.unsplash.com/... atau gunakan uploader"\n   - Konten (Markdown): "### Tips Coding\\n1. Jelas\\n2. Padat"\n5. Klik "Kirim / Terbitkan"',
      expected: 'Notifikasi sukses "Artikel berhasil ditambahkan" muncul. Artikel baru langsung tampil di halaman depan daftar artikel.',
      status: 'Belum Diuji',
      notes: 'Memanfaatkan modul uploader gambar terkompresi.'
    },
    {
      id: 'TC-ART-04',
      module: 'Artikel Pembelajaran AI',
      scenario: 'Upload Gambar / Screenshot Artikel (Compression)',
      steps: '1. Pada form Tambah Artikel, klik area "Upload Gambar / Screenshot"\n2. Pilih file gambar screenshot berukuran besar (> 2MB)\n3. Tunggu proses kompresi otomatis selesai',
      expected: 'Sistem berhasil melakukan kompresi otomatis (mengubah format ke JPEG 0.75 dengan resolusi maksimal 1200px) sehingga file menjadi sangat ringan (< 200KB) untuk menghemat penyimpanan localStorage.',
      status: 'Belum Diuji',
      notes: 'Pencegahan overload localStorage 5MB quota.'
    },
    {
      id: 'TC-ART-05',
      module: 'Artikel Pembelajaran AI',
      scenario: 'Edit Artikel (Role Admin)',
      steps: '1. Login sebagai Admin\n2. Cari artikel, lalu klik tombol "Edit" (ikon pensil)\n3. Ubah isi teks judul atau konten Markdown\n4. Klik "Simpan Perubahan"',
      expected: 'Perubahan tersimpan sukses. Ketika artikel dibaca kembali, judul dan isi sudah terupdate sesuai perubahan terbaru.',
      status: 'Belum Diuji',
      notes: 'Khusus hak akses admin.'
    },
    {
      id: 'TC-ART-06',
      module: 'Artikel Pembelajaran AI',
      scenario: 'Hapus Artikel (Role Admin)',
      steps: '1. Login sebagai Admin\n2. Pada kartu artikel, klik tombol "Hapus" (ikon sampah)\n3. Setujui dialog konfirmasi hapus artikel',
      expected: 'Artikel dihapus permanen dari daftar artikel dan tidak bisa diakses lagi oleh siapapun.',
      status: 'Belum Diuji',
      notes: 'Sistem memberikan peringatan yang aman.'
    },
    {
      id: 'TC-ART-07',
      module: 'Artikel Pembelajaran AI',
      scenario: 'Pembatasan Hak Akses Menulis/Edit (Role Karyawan)',
      steps: '1. Login sebagai Karyawan Biasa\n2. Buka Tab "Artikel Pembelajaran"',
      expected: 'Tombol "Tambah Artikel Baru", tombol "Edit" (ikon pensil), dan tombol "Hapus" (ikon sampah) sama sekali tidak ditampilkan kepada karyawan biasa.',
      status: 'Belum Diuji',
      notes: 'Karyawan biasa bersifat read-only di modul ini.'
    },
    {
      id: 'TC-ART-08',
      module: 'Artikel Pembelajaran AI',
      scenario: 'Zoom Gambar / Lightbox Screenshot',
      steps: '1. Buka salah satu artikel yang memiliki gambar / screenshot di dalamnya\n2. Klik langsung pada gambar tersebut',
      expected: 'Gambar memperbesar menjadi lightbox fullscreen overlay di atas artikel, menampilkan detail screenshot dengan jelas. Klik tombol silang (X) atau area luar untuk menutup.',
      status: 'Belum Diuji',
      notes: 'Penting untuk memperjelas teks screenshot tutorial.'
    },
    {
      id: 'TC-ADM-01',
      module: 'Portal Admin - Dashboard BI',
      scenario: 'Kartu KPI Utama Real-time',
      steps: '1. Login sebagai Admin\n2. Amati 3 kartu KPI utama di bagian atas dashboard:\n   - Total Laporan Pembelajaran\n   - Total Estimasi Waktu Dihemat\n   - Tingkat Kepatuhan Siklus Ini',
      expected: 'Semua angka di kartu KPI cocok secara matematis dengan agregat data yang ada pada database dan langsung bertambah otomatis jika karyawan memasukkan laporan baru.',
      status: 'Belum Diuji',
      notes: 'Data terhitung real-time.'
    },
    {
      id: 'TC-ADM-02',
      module: 'Portal Admin - Dashboard BI',
      scenario: 'Grafik Tren Penggunaan Tools AI',
      steps: '1. Login sebagai Admin\n2. Buka Tab "Dashboard Analisis"\n3. Cek grafik "Tren Penggunaan Tools AI per Bulan"\n4. Arahkan kursor (hover) ke atas titik data grafik',
      expected: 'Grafik menampilkan garis tren penggunaan masing-masing AI (Gemini, ChatGPT, Claude, dll). Tooltip hover menampilkan jumlah frekuensi penggunaan dalam unit "Kali" secara akurat.',
      status: 'Belum Diuji',
      notes: 'Grafik mendukung pagination tampilan 6 bulan.'
    },
    {
      id: 'TC-ADM-03',
      module: 'Portal Admin - Kepatuhan',
      scenario: 'Ubah Siklus Pelaporan & Konfirmasi',
      steps: '1. Di Tab "Pemantauan Kepatuhan Laporan", klik tombol pengubah siklus ke "Dua Mingguan"\n2. Batalkan pada pop-up konfirmasi\n3. Klik ulang "Dua Mingguan", lalu setujui konfirmasi',
      expected: 'Langkah 2: Siklus tetap Bulanan. Langkah 3: Siklus berubah menjadi Dua Mingguan, mengubah kalender deadline dan status kepatuhan karyawan secara instan.',
      status: 'Belum Diuji',
      notes: 'Mencegah admin salah pencet siklus.'
    },
    {
      id: 'TC-ADM-04',
      module: 'Portal Admin - Kepatuhan',
      scenario: 'Daftar Kepatuhan Karyawan (Warning/Alert)',
      steps: '1. Lihat tabel "Kepatuhan Karyawan pada Siklus Aktif"\n2. Cek baris karyawan yang belum mengirimkan laporan sama sekali',
      expected: 'Karyawan yang belum melapor mendapat badge status merah "Belum Melapor" dengan indikator visual mencolok untuk memudahkan follow-up oleh admin.',
      status: 'Belum Diuji',
      notes: 'Status otomatis berubah hijau jika laporan masuk.'
    },
    {
      id: 'TC-ADM-05',
      module: 'Portal Admin - Kepatuhan',
      scenario: 'Ekspor Data Rekap CSV',
      steps: '1. Scroll ke bawah di Tab Kepatuhan, klik tombol "Unduh Data (CSV)"',
      expected: 'Browser mengunduh file CSV yang berisi rekam data lengkap laporan pembelajaran AI karyawan dengan format teratur.',
      status: 'Belum Diuji',
      notes: 'Format CSV kompatibel dengan Microsoft Excel dan Google Sheets.'
    },
    {
      id: 'TC-USR-01',
      module: 'Manajemen Karyawan',
      scenario: 'Tambah Akun Karyawan Baru',
      steps: '1. Masuk ke Tab "Manajemen Karyawan"\n2. Isi form registrasi karyawan baru lengkap\n3. Klik "Simpan Karyawan"',
      expected: 'Karyawan baru terdaftar di tabel bawah. Akun baru tersebut dapat langsung digunakan untuk melakukan login.',
      status: 'Belum Diuji',
      notes: 'Default password diatur otomatis oleh sistem.'
    },
    {
      id: 'TC-USR-02',
      module: 'Manajemen Karyawan',
      scenario: 'Aktivasi / Nonaktifkan Akun',
      steps: '1. Cari karyawan di daftar manajemen\n2. Klik tombol toggle/status untuk mengubah ke "Nonaktif"\n3. Coba login dengan akun tersebut',
      expected: 'Status akun berubah menjadi nonaktif di database. Saat dicoba untuk login, login ditolak dengan notifikasi "Akun Anda dinonaktifkan".',
      status: 'Belum Diuji',
      notes: 'Sangat berguna untuk proses offboarding karyawan.'
    },
    {
      id: 'TC-USR-03',
      module: 'Manajemen Karyawan',
      scenario: 'Persetujuan Reset Password Karyawan',
      steps: '1. Karyawan meminta reset password lewat link lupa password\n2. Admin membuka Tab "Manajemen Karyawan"\n3. Setujui permintaan reset pada baris karyawan tersebut',
      expected: 'Permintaan disetujui. Karyawan kini dapat membuat password baru untuk login kembali.',
      status: 'Belum Diuji',
      notes: 'Mencegah pembajakan akun dengan alur otorisasi admin.'
    }
  ];

  // 3. Write "1. Ringkasan QA (Summary)" Sheet Content
  const summaryValues = [
    ['MODUL QA & SKENARIO PENGUJIAN - DASHBOARD PEMBELAJARAN AI KARYAWAN', ''],
    ['Dibuat secara Otomatis via Workspace Integration', ''],
    ['', ''],
    ['INFORMASI PROYEK', ''],
    ['Nama Aplikasi:', 'Dashboard Pembelajaran & Kepatuhan AI Karyawan'],
    ['Tanggal Dibuat:', new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })],
    ['QA Engineer:', 'Sistem QA Otomatis & Administrator'],
    ['Status Rilis:', 'Siap untuk Pengujian (Ready for QA)'],
    ['', ''],
    ['DAFTAR UNIT SUITE YANG DIUJI', ''],
    ['Kode Suite', 'Nama Modul / Area Pengujian', 'Total Skenario', 'Metode Pengujian', 'Status Terakhir'],
    ['TC-AUTH', 'Autentikasi & Multi-Role Access', '5', 'Manual / E2E', 'Belum Diuji'],
    ['TC-EMP', 'Portal Karyawan (Input & Kelola Laporan)', '5', 'Manual / E2E', 'Belum Diuji'],
    ['TC-ART', 'Artikel Pembelajaran AI (Markdown & Screen Zoom)', '8', 'Manual / UI & E2E', 'Belum Diuji'],
    ['TC-ADM-BI', 'Portal Admin (Dashboard & Analisis Tren)', '2', 'Manual / UI', 'Belum Diuji'],
    ['TC-ADM-CP', 'Portal Admin (Siklus & Kepatuhan Laporan)', '3', 'Manual / E2E', 'Belum Diuji'],
    ['TC-ADM-US', 'Portal Admin (Manajemen Karyawan & Reset)', '3', 'Manual / E2E', 'Belum Diuji'],
    ['', ''],
    ['PETUNJUK PENGGUNAAN LEMBAR QA', ''],
    ['1.', 'Lakukan pengujian secara manual sesuai kolom "Langkah-Langkah Pengujian" di Sheet kedua.'],
    ['2.', 'Ubah kolom "Status" menjadi "PASSED" (jika sukses) atau "FAILED" (jika ada bug).'],
    ['3.', 'Tulis temuan atau bukti pengujian pada kolom "Catatan" untuk ditindaklanjuti oleh Developer.'],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'1. Ringkasan QA (Summary)'!A1",
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: summaryValues,
    },
  });

  // 4. Write "2. Skenario Pengujian (Test Cases)" Sheet Content
  const testCaseHeader = [
    ['ID KASUS', 'MODUL APLIKASI', 'SKENARIO PENGUJIAN', 'LANGKAH-LANGKAH PENGUJIAN', 'HASIL YANG DIHARAPKAN', 'STATUS', 'CATATAN']
  ];

  const testCaseBody = testCases.map(tc => [
    tc.id,
    tc.module,
    tc.scenario,
    tc.steps,
    tc.expected,
    tc.status,
    tc.notes
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'2. Skenario Pengujian (Test Cases)'!A1",
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [...testCaseHeader, ...testCaseBody],
    },
  });

  // 5. Apply Professional Formatting & Styling via BatchUpdate
  // Let's make it look absolutely stunning!
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        // Column Widths for Sheet 1
        {
          updateDimensionProperties: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[0]?.properties?.sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 5,
            },
            properties: {
              pixelSize: 180,
            },
            fields: 'pixelSize',
          },
        },
        // Column Widths for Sheet 2
        {
          updateDimensionProperties: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[1]?.properties?.sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 1, // ID Column
            },
            properties: {
              pixelSize: 85,
            },
            fields: 'pixelSize',
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[1]?.properties?.sheetId,
              dimension: 'COLUMNS',
              startIndex: 1,
              endIndex: 2, // Module Column
            },
            properties: {
              pixelSize: 180,
            },
            fields: 'pixelSize',
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[1]?.properties?.sheetId,
              dimension: 'COLUMNS',
              startIndex: 2,
              endIndex: 3, // Scenario Column
            },
            properties: {
              pixelSize: 240,
            },
            fields: 'pixelSize',
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[1]?.properties?.sheetId,
              dimension: 'COLUMNS',
              startIndex: 3,
              endIndex: 4, // Steps Column
            },
            properties: {
              pixelSize: 340,
            },
            fields: 'pixelSize',
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[1]?.properties?.sheetId,
              dimension: 'COLUMNS',
              startIndex: 4,
              endIndex: 5, // Expected Column
            },
            properties: {
              pixelSize: 340,
            },
            fields: 'pixelSize',
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[1]?.properties?.sheetId,
              dimension: 'COLUMNS',
              startIndex: 5,
              endIndex: 6, // Status Column
            },
            properties: {
              pixelSize: 110,
            },
            fields: 'pixelSize',
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[1]?.properties?.sheetId,
              dimension: 'COLUMNS',
              startIndex: 6,
              endIndex: 7, // Notes Column
            },
            properties: {
              pixelSize: 220,
            },
            fields: 'pixelSize',
          },
        },
        // Format Header on Sheet 1 (Title Block Merge & Large Font)
        {
          mergeCells: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[0]?.properties?.sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 6,
            },
            mergeType: 'MERGE_ALL',
          },
        },
        {
          updateCells: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[0]?.properties?.sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 6,
            },
            rows: [
              {
                values: [
                  {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.08, green: 0.36, blue: 0.35 }, // Vascomm Dark Teal
                      textFormat: {
                        fontFamily: 'Roboto',
                        fontSize: 14,
                        bold: true,
                        foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                      },
                      horizontalAlignment: 'CENTER',
                      verticalAlignment: 'MIDDLE',
                    },
                  },
                ],
              },
            ],
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        // Sheet 2 Header Formatting (Slate Blue Header Background)
        {
          updateCells: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[1]?.properties?.sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 7,
            },
            rows: [
              {
                values: Array(7).fill({
                  userEnteredFormat: {
                    backgroundColor: { red: 0.12, green: 0.16, blue: 0.23 }, // Dark Slate header
                    textFormat: {
                      fontFamily: 'Roboto',
                      fontSize: 11,
                      bold: true,
                      foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    },
                    horizontalAlignment: 'LEFT',
                    verticalAlignment: 'MIDDLE',
                  },
                }),
              },
            ],
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
          },
        },
        // Auto-wrap and grid alignments on Sheet 2 body
        {
          updateCells: {
            range: {
              sheetId: spreadsheetResponse.data.sheets?.[1]?.properties?.sheetId,
              startRowIndex: 1,
              endRowIndex: 100,
              startColumnIndex: 0,
              endColumnIndex: 7,
            },
            rows: Array(99).fill({
              values: Array(7).fill({
                userEnteredFormat: {
                  textFormat: {
                    fontFamily: 'Roboto',
                    fontSize: 10,
                  },
                  wrapStrategy: 'WRAP',
                  verticalAlignment: 'TOP',
                },
              }),
            }),
            fields: 'userEnteredFormat(textFormat,wrapStrategy,verticalAlignment)',
          },
        },
      ],
    },
  });

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}
