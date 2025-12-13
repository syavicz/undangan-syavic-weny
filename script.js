const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbzDWWftX9Pmdg0xAZx4CNpS5JI2nBgfwRtzfSOZ3-6lr4C1zvmDe2PAcgOQrVUWct1dQA/exec";

/* ==================== HELPER FUNCTIONS ==================== */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const log = (...args) => console.debug("[WeniSyavic]", ...args);

/**
 * Escape HTML entities to prevent XSS
 * @param {string} s
 * @returns {string}
 */
function escapeHtml(s) {
  if (!s && s !== 0) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/* ==================== GUEST NAME ==================== */
function initGuestName() {
  try {
    const params = new URLSearchParams(window.location.search);
    const guestRaw = params.get("to") || "";
    const formatName = (name) =>
      name
        .toLowerCase()
        .split(" ")
        .filter((w) => w.trim())
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ");

    const guestName = guestRaw.trim() ? formatName(guestRaw) : "Tamu Undangan";

    // Pakai helper DOM
    const el1 = $("#guest-name");
    const el2 = $("#guest-secondname");

    if (el1) el1.textContent = guestName;
    if (el2) el2.style.display = guestRaw.trim() ? "none" : "";

    // simpan global
    window.invitedName = guestName;
    log("Guest name initialized:", guestName);

    // kirim ke sheet
    fetch(WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "guestName",
        name: guestName,
      }),
    })
      .then((res) => log("Guest name sent to sheet:", res.status))
      .catch((err) => console.error("Guest name send error:", err));
  } catch (e) {
    console.error("initGuestName error", e);
    window.invitedName = "Tamu Undangan";
  }
}

/* ==================== CALENDAR (.ics) ==================== */
function initCalendar() {
  $(".calendar-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    const start = new Date(Date.UTC(2025, 11, 29, 2, 0, 0));
    const end = new Date(Date.UTC(2025, 11, 29, 4, 0, 0));
    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) =>
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z";

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//WeniSyavic//Wedding//ID",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@wenisyavic`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      "SUMMARY:Akad Nikah - Weni & Syavic",
      "LOCATION:Desa Pulau Lebar, Rawas Ulu, Musi Rawas Utara",
      "DESCRIPTION:Doa dan restu Anda sangat berarti bagi kami.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Weni_Syavic_Akad.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

/* ==================== COPY BUTTONS ==================== */
function initCopyBtns() {
  function showSnackbar(msg) {
    const sn = $("#snackbar");
    if (!sn) return;
    sn.textContent = msg;
    sn.style.display = "block";
    sn.setAttribute("aria-hidden", "false");
    setTimeout(() => {
      sn.style.display = "none";
      sn.setAttribute("aria-hidden", "true");
    }, 2500);
  }

  $$(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.target;
      const text = id
        ? (document.getElementById(id)?.innerText || "").trim()
        : "";
      if (!text) return showSnackbar("Tidak ada nomor");
      navigator.clipboard
        ?.writeText(text)
        .then(() => showSnackbar("Nomor rekening disalin: " + text))
        .catch(() => {
          try {
            prompt("Salin nomor rekening:", text);
          } catch (e) {}
        });
    });
  });
}

/* ==================== RSVP ==================== */
function initRsvp() {
  document.querySelectorAll(".rsvp-buttons .btn-rsvp").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const status = btn.dataset.status; // "Hadir" atau "Tidak Hadir"
      const name = window.invitedName || "Tamu Undangan";

      try {
        btn.disabled = true;

        const payload = {
          mode: "rsvp",
          name: name,
          status: status,
        };

        log("RSVP payload:", payload);

        const res = await fetch(WEBAPP_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        log("RSVP response:", res.status);

        const rsvpResult = document.getElementById("rsvpResult");
        if (rsvpResult) {
          rsvpResult.textContent = "Konfirmasi berhasil terkirim ✓";
        }

        btn.innerText = "Terkirim ✓";
      } catch (e) {
        console.error("RSVP error", e);

        const rsvpResult = document.getElementById("rsvpResult");
        if (rsvpResult) {
          rsvpResult.textContent = "Gagal mengirim konfirmasi ❌";
        }

        btn.innerText = "Gagal ❌";
        btn.disabled = false;
      }
    });
  });
}

/* ==================== WISH SEND ==================== */
function initWishSend() {
  const btn = $("#wishSend");
  const ta = $("#wishText");
  if (!btn || !ta) return;

  btn.addEventListener("click", async () => {
    const message = ta.value.trim();
    if (!message) return;

    btn.disabled = true;

    const payload = {
      mode: "wish",
      name: window.invitedName || "Tamu Undangan",
      message,
    };
    log("Wish payload:", payload);

    try {
      const res = await fetch(WEBAPP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      log("Wish response:", res.status);

      addWishToList(window.invitedName, message, true);
      ta.value = "";
      btn.disabled = false;
    } catch (e) {
      console.error("Wish error", e);
      alert("Gagal mengirim ucapan.");
      btn.disabled = false;
    }
  });
}

function loadWishes() {
  const list = $("#wishList");
  if (!list) return;

  fetch(WEBAPP_URL)
    .then((res) => res.json())
    .then((data) => {
      list.innerHTML = "";
      data
        .reverse()
        .forEach((row) => addWishToList(row.name, row.message, false));
    })
    .catch((err) => console.error("Load wishes error:", err));
}

function addWishToList(name, message, isNew) {
  const list = $("#wishList");
  if (!list) return;
  const li = document.createElement("li");
  li.classList.add("wish-item");
  if (isNew) li.classList.add("new");
  li.innerHTML = `<strong>${escapeHtml(name)}</strong>: ${escapeHtml(message)}`;
  list.prepend(li);
}

/* ==================== MUSIC CONTROL ==================== */
function initMusicControl() {
  const audio = $("#bgMusic");
  if (!audio) return;

  audio.volume = 0.3;
  let isPlaying = false;

  $("#openInviteBtn")?.addEventListener("click", () => {
    audio
      .play()
      .then(() => {
        isPlaying = true;
      })
      .catch((err) => console.warn("Audio play error:", err));
  });

  $("#musicControl")?.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause();
      $("#musicIcon") && ($("#musicIcon").style.opacity = "0.5");
    } else {
      audio.play();
      $("#musicIcon") && ($("#musicIcon").style.opacity = "1");
    }
    isPlaying = !isPlaying;
  });
}

/* ==================== GALLERY / LIGHTBOX / PETALS ==================== */
function initGalleryReveal() {
  const images = document.querySelectorAll(".grid-gallery img");
  function revealOnScroll() {
    const trigger = window.innerHeight * 0.85;
    images.forEach((img) => {
      if (img.getBoundingClientRect().top < trigger)
        img.classList.add("visible");
    });
  }
  revealOnScroll();
  window.addEventListener("scroll", revealOnScroll);
}

function initLightbox() {
  const lightbox = $("#lightbox");
  if (!lightbox) return;
  const lightboxImg = lightbox.querySelector("img");
  $$(".grid-gallery img").forEach((img) => {
    img.addEventListener("click", () => {
      if (lightboxImg) lightboxImg.src = img.src;
      lightbox.classList.add("active");
    });
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove("active");
      if (lightboxImg) lightboxImg.src = "";
    }
  });
}

function initPetals() {
  function createPetal() {
    const petal = document.createElement("div");
    petal.classList.add("petal");
    petal.style.left = Math.random() * 100 + "vw";
    const size = Math.random() * 12 + 8;
    petal.style.width = size + "px";
    petal.style.height = size + "px";
    petal.style.animationDuration = Math.random() * 4 + 4 + "s";
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 8000);
  }
  setInterval(createPetal, 300);
}

/* ==================== INIT ON DOM READY ==================== */
document.addEventListener("DOMContentLoaded", () => {
  initGuestName();
  initCalendar();
  initCopyBtns();
  initMusicControl();
  initRsvp();
  initWishSend();
  loadWishes();
  initGalleryReveal();
  initLightbox();
  initPetals();

  $("#btn-open")?.addEventListener("click", () => {
    $("#bottom-nav")?.classList.add("show");
  });

  $("#openInviteBtn")?.addEventListener("click", () => {
    $(".bottom-nav")?.classList.add("show-nav");
    $("#home")?.scrollIntoView({ behavior: "smooth" });

    // NEW: log ke sheet Ucapan
    fetch(WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "open",
        name: window.invitedName || "Tamu Undangan",
        status: "OPENED",
      }),
    }).catch((e) => console.error("Open log error", e));
  });
});






