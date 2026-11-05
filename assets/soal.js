// ============================================================
// KONFIGURASI
// Tempel URL Web App Google Apps Script di sini (lihat README).
// Selama masih kosong, website berjalan dalam "mode uji lokal":
// semua langkah bisa dicoba, tapi jawaban tidak dikirim ke mana pun.
// ============================================================
window.KONFIG = {
  SHEETS_URL: "https://script.google.com/macros/s/AKfycbyzSAojjTVdcD1PRMYZu9irc8cvDv6Qql09b6dhihufZJ3Kk5lDXcbzRmzorFqhPnuC/exec",
  VERSI_SOAL: "v1-2026-11",
};

// ============================================================
// TOPIK — dipakai di layar hasil sementara pretest.
// Responden hanya melihat jumlah benar per topik, tanpa nomor soal
// dan kunci, supaya posttest tidak sekadar mengganti jawaban yang salah.
// ============================================================
window.TOPIK = [
  { id: "batas", label: "Batas aman menfess", bagian: "Pembuka, Garis batasnya, dan Kesalahan yang paling sering terjadi" },
  { id: "aturan", label: "Aturan dan sanksi", bagian: "Aturan dan sanksinya" },
  { id: "sikap", label: "Memahami dan menyikapi menfess", bagian: "Kenapa ruang anonim gampang kebablasan, dan Kalau kamu jadi sasaran" },
];

// ============================================================
// SOAL — dipakai sama persis untuk pretest dan posttest.
// t = topik (lihat TOPIK di atas).
// Di posttest, urutan soal dan pilihan diacak otomatis.
// Kunci jawaban (huruf) juga tercantum di apps-script/Code.gs;
// kalau soal atau kunci diubah, ubah di kedua tempat.
// ============================================================
window.SOAL = [
  {
    q: "Prinsip yang paling tepat dipegang sebelum mengirim menfess adalah...",
    o: [
      "Selama tidak menyebut nama lengkap, isi apa pun boleh dikirim",
      "Kirim hanya hal yang tetap berani kamu pertanggungjawabkan jika namamu ikut tercantum",
      "Kirim apa saja selama admin menfess mau mengunggahnya",
      "Hindari menfess sama sekali karena semua akun anonim melanggar aturan",
    ],
    t: "batas",
    k: "B",
    p: "Anonim hanya menyembunyikan nama dari pembaca. Isi pesan tetap tanggung jawab pengirim. Opsi D keliru karena menfess sendiri tidak dilarang.",
  },
  {
    q: "Banyak orang lebih mudah berkata kasar lewat akun anonim daripada saat bertatap muka. Salah satu penyebabnya adalah...",
    o: [
      "Pengirim tidak melihat langsung reaksi orang yang menjadi sasaran",
      "Platform anonim selalu memberi imbalan kepada pengguna yang aktif",
      "Akun anonim tidak bisa dilaporkan ke platform",
      "Kata-kata kasar otomatis disensor sehingga terasa aman",
    ],
    t: "sikap",
    k: "A",
    p: "Tidak melihat wajah korban adalah salah satu faktor online disinhibition effect menurut Suler (2004). Dua faktor lain yang dibahas adalah merasa terpisah dari identitas asli dan adanya jeda waktu.",
  },
  {
    q: "Manakah isi menfess berikut yang termasuk zona hijau (aman)?",
    o: [
      "\"Spill\" kelakuan ketua himpunan tanpa menyebut nama, tetapi menyebut jurusan dan angkatannya",
      "Mengunggah tangkapan layar chat grup kepanitiaan untuk menunjukkan rapat yang kacau",
      "Menanyakan apakah ada yang menemukan kunci motor yang tertinggal di parkiran",
      "Meme yang mengejek mahasiswa dari daerah tertentu sebagai \"candaan\"",
    ],
    t: "batas",
    k: "C",
    p: "Mencari barang hilang termasuk zona hijau. Opsi A dan B termasuk zona kuning yang mudah berubah menjadi merah. Opsi D termasuk zona merah karena mengejek golongan.",
  },
  {
    q: "Sebuah menfess berbunyi: \"Buat asdos praktikum X angkatan 22 yang pakai kacamata, jangan sok galak deh.\" Tidak ada nama yang disebut. Bagaimana menilai unggahan ini?",
    o: [
      "Aman, karena tidak ada nama yang disebut",
      "Berisiko melanggar, karena ciri-cirinya cukup untuk membuat orang tersebut dikenali",
      "Aman, karena asisten dosen bukan dosen sehingga kode etik tidak berlaku",
      "Baru melanggar jika asdos tersebut membalas unggahannya",
    ],
    t: "batas",
    k: "B",
    p: "Mata kuliah, angkatan, dan ciri fisik sudah cukup bagi teman satu kampus untuk menebak orangnya. Asdos juga mahasiswa, jadi kewajiban terhadap sesama mahasiswa tetap berlaku.",
  },
  {
    q: "Seorang mahasiswa mengunggah rekap nilai seleksi panitia yang memuat nama dan NRP peserta lewat menfess. Aturan mana yang paling relevan dengan perbuatan ini?",
    o: [
      "UU Pelindungan Data Pribadi, karena ia mengungkapkan data pribadi yang bukan miliknya",
      "Tidak ada, karena dokumen itu dibagikan di grup yang ia ikuti",
      "Hanya aturan platform, karena hukum tidak berlaku untuk akun anonim",
      "UU Hak Cipta, karena rekap nilai adalah karya cipta panitia",
    ],
    t: "aturan",
    k: "A",
    p: "Pasal 65 ayat (2) UU 27/2022 melarang mengungkapkan data pribadi yang bukan miliknya. Bisa mengakses dokumen tidak sama dengan berhak menyebarkannya.",
  },
  {
    q: "Pernyataan yang benar tentang Kode Etik Mahasiswa ITS (Peraturan Rektor No. 34 Tahun 2025) adalah...",
    o: [
      "Hanya berlaku untuk kegiatan di dalam lingkungan kampus",
      "Hanya mengatur kecurangan akademik seperti plagiat dan joki",
      "Tidak bisa diterapkan jika pelakunya memakai akun anonim",
      "Berlaku untuk aktivitas mahasiswa di dalam maupun di luar kampus, termasuk di media sosial",
    ],
    t: "aturan",
    k: "D",
    p: "Pasal 4 menyebut ruang lingkupnya mencakup interaksi di dalam maupun di luar lingkungan ITS. Pasal 15 angka 8 secara khusus melarang pencemaran nama baik lewat media sosial.",
  },
  {
    q: "Sanksi yang dapat dijatuhkan menurut Kode Etik Mahasiswa ITS mencakup...",
    o: [
      "Hanya teguran lisan dari dosen wali",
      "Hanya denda uang yang dibayarkan ke kampus",
      "Mulai dari surat permohonan maaf hingga pencabutan status mahasiswa",
      "Pemblokiran akun media sosial pelaku oleh ITS",
    ],
    t: "aturan",
    k: "C",
    p: "Pasal 25 membagi sanksi menjadi ringan (surat permohonan maaf, kerja sosial), sedang (pembatalan mata kuliah, penundaan wisuda, skorsing hingga 1 semester), dan berat (skorsing hingga 2 semester, dilaporkan ke penegak hukum, pencabutan status mahasiswa).",
  },
  {
    q: "Seorang senior berkali-kali mengunggah menfess yang mengejek seorang mahasiswa baru dan menyebutnya \"pembinaan\". Perbuatan ini termasuk...",
    o: [
      "Perundungan, karena kekerasan psikis dilakukan berulang dan ada ketimpangan relasi kuasa",
      "Bukan kekerasan, karena dilakukan lewat media sosial dan bukan tatap muka",
      "Bukan kekerasan, karena tujuannya pembinaan",
      "Bukan masalah selama tidak ada kontak fisik",
    ],
    t: "aturan",
    k: "A",
    p: "Menurut Permendikbudristek 55/2024, kekerasan bisa dilakukan lewat media elektronik (Pasal 7 ayat 3). Ejekan yang merendahkan termasuk kekerasan psikis (Pasal 10). Jika dilakukan berulang dengan ketimpangan relasi kuasa, perbuatan itu termasuk perundungan (Pasal 11).",
  },
  {
    q: "Muncul menfess yang menyindir sebuah organisasi kampus, dan banyak orang di kolom balasan mencoba menebak siapa pengirimnya. Sikap yang paling tepat adalah...",
    o: [
      "Ikut menebak supaya pengirimnya jera",
      "Menanyakan identitas pengirim ke admin menfess lalu menyebarkannya",
      "Membalas unggahan itu dengan sindiran yang sama",
      "Tidak ikut menebak, karena membongkar identitas pengguna anonim melanggar kebijakan X dan bisa salah sasaran",
    ],
    t: "batas",
    k: "D",
    p: "Kebijakan Private Content X memasukkan identitas pengguna anonim sebagai informasi pribadi. Tebakan yang salah juga bisa menyeret orang yang tidak bersalah.",
  },
  {
    q: "Kamu menjadi sasaran menfess yang menghina. Langkah pertama yang paling tepat adalah...",
    o: [
      "Membalas di kolom komentar supaya semua orang tahu versimu",
      "Menghapus seluruh akun media sosialmu",
      "Menyimpan bukti tangkapan layar beserta nama akun, tanggal, dan tautan, lalu melaporkannya",
      "Mengirim menfess balasan yang menyerang balik",
    ],
    t: "sikap",
    k: "C",
    p: "Bukti diperlukan untuk laporan ke platform maupun ke kampus (departemen, unit kemahasiswaan, atau Satgas PPKPT). Membalas di komentar justru membuat unggahan makin ramai.",
  },
];
