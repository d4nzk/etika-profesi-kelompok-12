(function () {
  "use strict";

  var SOAL = window.SOAL;
  var TOPIK = window.TOPIK || [];
  var KONFIG = window.KONFIG || {};
  var N = SOAL.length;
  var HURUF = ["A", "B", "C", "D"];
  var KEY = "etprof12-" + (KONFIG.VERSI_SOAL || "v1");
  var URUTAN = ["intro", "pre", "prehasil", "materi", "post", "hasil"];
  // Layar hasil sementara pretest masih dihitung sebagai tahap "Pretest" di bilah langkah.
  var TAHAP = { intro: "intro", pre: "pre", prehasil: "pre", materi: "materi", post: "post", hasil: "hasil" };
  var LANGKAH = ["pre", "materi", "post", "hasil"];
  var FADE_MS = 220; // samakan dengan durasi transisi .fade di style.css
  var reduceMotion = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  // ---------- penyimpanan progres di browser responden ----------
  // Supaya jawaban tidak hilang kalau halaman tidak sengaja dimuat ulang.
  
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s && s.id && !s.sent && !(s.step === "hasil" && !KONFIG.SHEETS_URL)) return s;
      localStorage.removeItem(KEY);
    } catch (e) {}
    return null;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function clearSaved() { try { localStorage.removeItem(KEY); } catch (e) {} }
  function mulaiBaru() { clearSaved(); location.replace(location.pathname); }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "r-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function now() { return new Date().toISOString(); }
  function secs(a, b) { return a && b ? Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 1000)) : ""; }
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // ---------- animasi fade ----------
  function fadeOut(node, done) {
    if (!node || reduceMotion.matches) { done(); return; }
    node.classList.add("fade");
    setTimeout(done, FADE_MS);
  }
  function fadeIn(node) {
    if (!node) return;
    if (reduceMotion.matches) { node.classList.remove("fade"); return; }
    node.classList.add("fade");
    void node.offsetWidth; // paksa browser menggambar keadaan awal sebelum transisi
    node.classList.remove("fade");
  }

  // Uji lokal: buka index.html?reset untuk mulai dari awal.
  if (/[?&]reset\b/.test(location.search)) {
    try { localStorage.removeItem(KEY); } catch (e) {}
    history.replaceState(null, "", location.pathname);
  }

  var state = load() || {
    id: uid(),
    step: "intro",
    profil: { departemen: "", angkatan: "" },
    pre: { answers: {}, idx: 0, start: "", end: "" },
    materi: { start: "", end: "" },
    post: { order: shuffle(range(N)), opts: range(N).map(function () { return shuffle(range(4)); }), answers: {}, idx: 0, start: "", end: "" },
    sent: false,
  };
  if (URUTAN.indexOf(state.step) < 0) state.step = "intro";

  if (!KONFIG.SHEETS_URL) $("modeUji").hidden = false;

  // ---------- navigasi antartahap ----------
  var busy = false;
  function go(step) {
    if (busy) return;
    busy = true;
    var cur = document.querySelector(".view:not([hidden])");
    state.step = step;
    save();
    fadeOut(cur, function () {
      if (cur) cur.classList.remove("fade");
      window.scrollTo(0, 0);
      show();
      window.scrollTo(0, 0);
      busy = false;
    });
  }

  function show() {
    URUTAN.forEach(function (s) { $("view-" + s).hidden = s !== state.step; });
    var nav = $("steps");
    nav.hidden = state.step === "intro";
    var idx = LANGKAH.indexOf(TAHAP[state.step]);
    Array.prototype.forEach.call(nav.querySelectorAll("li"), function (li) {
      var i = LANGKAH.indexOf(li.getAttribute("data-step"));
      li.className = i < idx ? "done" : i === idx ? "now" : "";
      if (i === idx) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    if (state.step === "pre" || state.step === "post") renderQuiz(state.step);
    if (state.step === "prehasil") renderPreHasil();
    if (state.step === "materi") {
      if (!state.materi.start) { state.materi.start = now(); save(); }
      setupReveal();
    }
    if (state.step === "hasil") renderHasil();
    fadeIn($("view-" + state.step));
  }

  // ---------- animasi materi saat digulir ----------
  // Bagian materi yang masih di bawah layar muncul perlahan ketika digulir ke sana.
  // Yang sudah terlihat saat halaman dibuka tidak disembunyikan.
  var revealReady = false;
  function setupReveal() {
    if (revealReady || reduceMotion.matches || !("IntersectionObserver" in window)) return;
    revealReady = true;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    var items = $("view-materi").querySelectorAll(":scope > .card, .zone, .rules > details");
    Array.prototype.forEach.call(items, function (n) {
      if (n.getBoundingClientRect().top < window.innerHeight * 0.9) return;
      n.classList.add("reveal");
      io.observe(n);
    });
  }

  // ---------- pembuka ----------
  (function initIntro() {
    var sel = $("angkatan");
    for (var y = 2026; y >= 2023; y--) sel.appendChild(new Option(String(y), String(y)));
    sel.appendChild(new Option("2022 atau sebelumnya", "<=2022"));

    var dep = $("departemen"), ok = $("setuju"), btn = $("btnMulai");
    dep.value = state.profil.departemen; sel.value = state.profil.angkatan;
    function check() {
      var valid = dep.value.trim().length > 1 && sel.value && ok.checked;
      btn.disabled = !valid;
      $("introHint").hidden = valid;
    }
    [dep, sel, ok].forEach(function (x) { x.addEventListener("input", check); x.addEventListener("change", check); });
    check();
    $("formIntro").addEventListener("submit", function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      state.profil = { departemen: dep.value.trim().slice(0, 80), angkatan: sel.value };
      state.pre.start = now();
      go("pre");
    });
  })();

  // ---------- kuis, satu soal per layar ----------
  function orderOf(kind) { return kind === "pre" ? range(N) : state.post.order; }

  function renderQuiz(kind) {
    var part = state[kind];
    var order = orderOf(kind);
    var pos = Math.max(0, Math.min(part.idx || 0, N - 1));
    part.idx = pos;
    if (!part.start) part.start = now();
    save();
    var qi = order[pos];
    var s = SOAL[qi];
    var box = $(kind === "pre" ? "quizPre" : "quizPost");
    box.textContent = "";

    // kepala: label + titik progres
    var head = el("div", "qhead");
    head.appendChild(el("span", "eyebrow", (kind === "pre" ? "Pretest" : "Posttest") + " · Soal " + (pos + 1) + " dari " + N));
    var dots = el("ol", "dots");
    dots.setAttribute("aria-hidden", "true");
    order.forEach(function (q, i) {
      var d = el("li", (part.answers[q] ? "ans" : "") + (i === pos ? " cur" : ""));
      dots.appendChild(d);
    });
    head.appendChild(dots);
    box.appendChild(head);

    // isi soal
    var body = el("div", "qbody");
    var fs = el("fieldset");
    fs.appendChild(el("legend", "qtext", s.q));
    var optOrder = kind === "pre" ? range(4) : part.opts[qi];
    optOrder.forEach(function (oi, shown) {
      var id = kind + "-" + qi + "-" + oi;
      var lab = el("label", "opt");
      lab.htmlFor = id;
      var inp = document.createElement("input");
      inp.type = "radio"; inp.name = kind + "-" + qi; inp.id = id; inp.value = HURUF[oi];
      inp.checked = part.answers[qi] === HURUF[oi];
      inp.addEventListener("change", function () {
        part.answers[qi] = inp.value;
        save();
        next.disabled = false;
        dots.children[pos].classList.add("ans");
      });
      lab.appendChild(inp);
      lab.appendChild(el("span", "l", HURUF[shown]));
      lab.appendChild(el("span", "", s.o[oi]));
      fs.appendChild(lab);
    });
    body.appendChild(fs);
    box.appendChild(body);

    // tombol Kembali / Lanjut
    var nav = el("div", "qnav");
    var back = el("button", "btn ghost", "Kembali");
    back.type = "button";
    back.disabled = pos === 0;
    back.addEventListener("click", function () { moveQ(kind, -1); });
    var last = pos === N - 1;
    var next = el("button", "btn", last ? (kind === "pre" ? "Kirim pretest" : "Kirim posttest") : "Lanjut");
    next.type = "button";
    next.disabled = !part.answers[qi];
    next.addEventListener("click", function () {
      if (!part.answers[qi]) return;
      if (last) finish(kind); else moveQ(kind, 1);
    });
    nav.appendChild(back);
    nav.appendChild(next);
    box.appendChild(nav);
    if (last) box.appendChild(el("p", "small muted", "Setelah dikirim, jawaban " + (kind === "pre" ? "pretest" : "posttest") + " tidak bisa diubah. Pakai Kembali kalau ingin memeriksa lagi."));
    return body;
  }

  function moveQ(kind, delta) {
    if (busy) return;
    var part = state[kind];
    var target = (part.idx || 0) + delta;
    if (target < 0 || target >= N) return;
    busy = true;
    var box = $(kind === "pre" ? "quizPre" : "quizPost");
    fadeOut(box.querySelector(".qbody"), function () {
      part.idx = target;
      save();
      var body = renderQuiz(kind);
      fadeIn(body);
      var top = box.getBoundingClientRect().top;
      if (top < 0) window.scrollBy(0, top - 70);
      var first = box.querySelector("input:checked") || box.querySelector("input");
      if (first) first.focus({ preventScroll: true });
      busy = false;
    });
  }

  function answered(kind) { return Object.keys(state[kind].answers).length; }

  function finish(kind) {
    if (answered(kind) < N) {
      // Seharusnya tidak terjadi karena Lanjut terkunci sampai soal dijawab; arahkan ke soal kosong pertama.
      var order = orderOf(kind);
      for (var i = 0; i < N; i++) if (!state[kind].answers[order[i]]) { moveQ(kind, i - state[kind].idx); return; }
    }
    state[kind].end = now();
    if (kind === "pre") go("prehasil");
    else { go("hasil"); kirim(); }
  }

  // ---------- hasil sementara pretest ----------
  function skor(kind) {
    var a = state[kind].answers, s = 0;
    for (var i = 0; i < N; i++) if (a[i] === SOAL[i].k) s++;
    return s;
  }

  function renderPreHasil() {
    var v = $("preSkor");
    v.textContent = String(skor("pre"));
    v.appendChild(el("small", "", " / " + N));
    var list = $("preTopik");
    list.textContent = "";
    TOPIK.forEach(function (t) {
      var total = 0, benar = 0;
      SOAL.forEach(function (s, i) { if (s.t === t.id) { total++; if (state.pre.answers[i] === s.k) benar++; } });
      if (!total) return;
      var li = el("li", "topic" + (benar === total ? " full" : ""));
      li.appendChild(el("span", "tl", t.label));
      li.appendChild(el("span", "tc", benar + " dari " + total + " benar"));
      var m = el("span", "meter");
      var bar = el("span");
      bar.style.width = Math.round((benar / total) * 100) + "%";
      m.appendChild(bar);
      li.appendChild(m);
      li.appendChild(el("span", "hint", benar === total ? "Sudah tepat semua." : "Perhatikan bagian: " + t.bagian + "."));
      list.appendChild(li);
    });
  }

  $("btnPreHasil").addEventListener("click", function () { go("materi"); });
  $("btnMateri").addEventListener("click", function () {
    state.materi.end = now();
    state.post.start = now();
    go("post");
  });

  // ---------- hasil akhir ----------
  function optText(qi, letter) {
    var i = HURUF.indexOf(letter);
    return i < 0 ? "–" : SOAL[qi].o[i];
  }

  function renderHasil() {
    var pre = skor("pre"), post = skor("post"), d = post - pre;
    var box = $("scores");
    box.textContent = "";
    function tile(label, val, extra, cls) {
      var t = el("div", "score" + (cls ? " " + cls : ""));
      t.appendChild(el("span", "lbl", label));
      var v = el("span", "v", val);
      if (extra) v.appendChild(el("small", "", extra));
      t.appendChild(v);
      box.appendChild(t);
    }
    tile("Pretest", String(pre), " / " + N);
    tile("Posttest", String(post), " / " + N);
    tile("Perubahan", (d > 0 ? "+" : "") + d, " soal", "delta " + (d > 0 ? "up" : d < 0 ? "down" : ""));

    var rv = $("review");
    rv.textContent = "";
    SOAL.forEach(function (s, qi) {
      var li = el("li", "rv");
      li.appendChild(el("p", "qt", (qi + 1) + ". " + s.q));
      var dl = el("dl", "ans");
      [["Pretest", state.pre.answers[qi]], ["Posttest", state.post.answers[qi]]].forEach(function (row) {
        dl.appendChild(el("dt", "", row[0]));
        var dd = el("dd", "", optText(qi, row[1]));
        var right = row[1] === s.k;
        dd.appendChild(el("span", "mark " + (right ? "y" : "n"), right ? "benar" : "salah"));
        dl.appendChild(dd);
      });
      dl.appendChild(el("dt", "", "Jawaban"));
      dl.appendChild(el("dd", "", optText(qi, s.k)));
      li.appendChild(dl);
      li.appendChild(el("p", "why", s.p));
      rv.appendChild(li);
    });
    renderStatus();
  }

  // ---------- pengiriman ke Google Sheets ----------
  // Jawaban per soal dikirim agar Apps Script bisa menghitung ulang skornya,
  // tetapi yang disimpan di Sheets hanya skor, durasi, dan waktu.
  var sending = false;
  function payload() {
    var pre = [], post = [];
    for (var i = 0; i < N; i++) { pre.push(state.pre.answers[i] || ""); post.push(state.post.answers[i] || ""); }
    return {
      id: state.id,
      versi: KONFIG.VERSI_SOAL || "",
      departemen: state.profil.departemen,
      angkatan: state.profil.angkatan,
      pre: pre,
      post: post,
      durasiPre: secs(state.pre.start, state.pre.end),
      durasiMateri: secs(state.materi.start, state.materi.end),
      durasiPost: secs(state.post.start, state.post.end),
      mulai: state.pre.start,
    };
  }

  function renderStatus(msg) {
    var box = $("sendStatus");
    box.textContent = "";
    $("baruWrap").hidden = !(state.sent || !KONFIG.SHEETS_URL);
    if (!KONFIG.SHEETS_URL) {
      box.className = "status wait";
      box.appendChild(el("span", "", "Mode uji lokal: jawaban tidak dikirim. Isinya bisa dilihat di Console browser."));
      return;
    }
    if (state.sent) { box.className = "status ok"; box.appendChild(el("span", "", "Jawabanmu sudah tersimpan.")); return; }
    if (sending) { box.className = "status wait"; box.appendChild(el("span", "", "Menyimpan jawaban...")); return; }
    box.className = "status err";
    box.appendChild(el("span", "", msg || "Jawaban belum tersimpan. Periksa koneksi internet, lalu coba lagi."));
    var b = el("button", "btn", "Kirim ulang");
    b.type = "button";
    b.addEventListener("click", kirim);
    box.appendChild(b);
  }

  function kirim() {
    var data = payload();
    if (!KONFIG.SHEETS_URL) { console.log("[Mode uji] Data yang akan dikirim:", data); renderStatus(); return; }
    if (state.sent || sending) return;
    sending = true; renderStatus();
    // Body dikirim sebagai text/plain agar tidak memicu preflight CORS di Apps Script.
    fetch(KONFIG.SHEETS_URL, { method: "POST", body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        sending = false;
        if (res && res.ok) { state.sent = true; clearSaved(); renderStatus(); }
        else renderStatus("Server menolak data (" + ((res && res.error) || "tanpa keterangan") + "). Hubungi Kelompok 12.");
      })
      .catch(function () { sending = false; renderStatus(); });
  }

  $("btnBaru").addEventListener("click", mulaiBaru);
  show();
  // Responden yang sempat gagal kirim lalu membuka lagi halaman ini: coba kirim otomatis.
  if (state.step === "hasil" && !state.sent && KONFIG.SHEETS_URL) kirim();
})();
