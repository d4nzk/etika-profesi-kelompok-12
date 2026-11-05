/**
 * Penerima jawaban — Etika Bermenfess, Kelompok 12.
 *
 * Pasang di Google Sheets: Ekstensi → Apps Script, tempel seluruh file ini,
 * lalu Deploy → New deployment → Web app (langkah lengkap di README).
 *
 * Setiap responden menjadi satu baris di sheet "Jawaban".
 * Browser mengirim jawaban per soal hanya supaya skor dihitung ulang di sini
 * dari KUNCI. Yang disimpan cuma ringkasannya: waktu, departemen, angkatan,
 * skor, selisih, dan durasi. Jawaban per soal tidak disimpan.
 */

var SHEET_NAME = 'Jawaban';

// Kunci soal 1–10 sesuai urutan di assets/soal.js. Ubah di dua tempat kalau soal berubah.
var KUNCI = ['B', 'A', 'C', 'B', 'A', 'D', 'C', 'A', 'D', 'C'];

var HEADER = [
  'mulai', 'selesai', 'departemen', 'angkatan',
  'skor_pre', 'skor_post', 'selisih',
  'durasi_pre_dtk', 'durasi_materi_dtk', 'durasi_post_dtk',
  'id_responden', // kode acak, hanya untuk mencegah baris ganda
];
var KOLOM_ID = HEADER.indexOf('id_responden') + 1;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: 'sibuk' });
  }
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (typeof d.id !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(d.id)) return json_({ ok: false, error: 'id tidak valid' });
    var pre = answers_(d.pre), post = answers_(d.post);
    if (!pre || !post) return json_({ ok: false, error: 'jawaban tidak lengkap' });

    var sh = sheet_();

    // Cegah baris ganda kalau browser mengirim ulang.
    var last = sh.getLastRow();
    if (last > 1) {
      var found = sh.getRange(2, KOLOM_ID, last - 1, 1).createTextFinder(d.id).matchEntireCell(true).findNext();
      if (found) return json_({ ok: true, duplikat: true });
    }

    var sPre = score_(pre), sPost = score_(post);
    sh.appendRow([
      date_(d.mulai), new Date(), text_(d.departemen, 80), text_(d.angkatan, 20),
      sPre, sPost, sPost - sPre,
      num_(d.durasiPre), num_(d.durasiMateri), num_(d.durasiPost),
      d.id,
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'format data salah' });
  } finally {
    lock.releaseLock();
  }
}

// Buka URL Web App di browser untuk mengecek apakah deploy berhasil.
function doGet() {
  return ContentService.createTextOutput('Penerima jawaban Kelompok 12 aktif.');
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  // Kalau judul kolom sheet lama berbeda (misalnya dari versi script sebelumnya),
  // sheet itu diganti namanya dan dibuat sheet "Jawaban" baru, supaya kolom tidak tercampur.
  if (sh && sh.getLastRow() > 0) {
    var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].join('|');
    if (head !== HEADER.join('|')) {
      var stamp = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH.mm');
      sh.setName(SHEET_NAME + ' (format lama ' + stamp + ')');
      sh = null;
    }
  }
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADER.length).setFontWeight('bold');
    sh.getRange('A:B').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  return sh;
}

function answers_(a) {
  if (!Array.isArray(a) || a.length !== KUNCI.length) return null;
  for (var i = 0; i < a.length; i++) if (['A', 'B', 'C', 'D'].indexOf(a[i]) === -1) return null;
  return a;
}

function score_(a) {
  var s = 0;
  for (var i = 0; i < KUNCI.length; i++) if (a[i] === KUNCI[i]) s++;
  return s;
}

// Waktu mulai berasal dari jam perangkat responden; kosongkan kalau tidak masuk akal.
function date_(v) {
  var t = new Date(v);
  if (isNaN(t.getTime())) return '';
  var selisihJam = Math.abs(Date.now() - t.getTime()) / 36e5;
  return selisihJam > 24 ? '' : t;
}

// Teks dari responden dipotong dan diberi tanda petik di depan kalau diawali = + - @,
// supaya tidak dibaca Sheets sebagai rumus.
function text_(v, max) {
  var s = String(v == null ? '' : v).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function num_(v) {
  var n = Number(v);
  return isFinite(n) && n >= 0 ? Math.round(n) : '';
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
