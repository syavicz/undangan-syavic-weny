

/* ----- Helpers ----- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* ----- Guest name from URL ----- */
(function setGuestFromUrl(){
  try {
    const params = new URLSearchParams(location.search);
    const to = params.get('to') || params.get('nama') || '';
    if (to) $('#guest-name').textContent = decodeURIComponent(to);
  } catch(e){}
})();

/* ----- Music control ----- */
const audio = $('#bgMusic');
const disc = $('#music-disc');

if (disc && audio) {
  disc.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      disc.classList.remove("paused");
    } else {
      audio.pause();
      disc.classList.add("paused");
    }
  });

  const updateMusicIcon = () => {
    if (audio.paused) disc.classList.add('paused');
    else disc.classList.remove('paused');
  };

  audio.addEventListener('play', updateMusicIcon);
  audio.addEventListener('pause', updateMusicIcon);
  updateMusicIcon();
}

/* ----- Countdown (single version) ----- */
function updateCountdown(){
  const target = new Date('2025-11-29T09:00:00+07:00');
  const now = new Date();
  const diff = target - now;
  const el = $('#countdown');

  if (!el) return;

  if (diff <= 0){
    el.textContent = 'Hari H';
    return;
  }

  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff/(1000*60*60))%24);
  const m = Math.floor((diff/(1000*60))%60);
  const s = Math.floor((diff/1000)%60);

  el.textContent = `${d} Hari ${h} Jam ${m} Menit ${s} Detik`;

  const ct = $('#countdown-top');
  if (ct) {
    ct.innerHTML = `
      <span>${String(d).padStart(2,'0')}</span> Hari
      <span>${String(h).padStart(2,'0')}</span> Jam
      <span>${String(m).padStart(2,'0')}</span> Menit
      <span>${String(s).padStart(2,'0')}</span> Detik
    `;
  }
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* ----- Save Calendar (.ics) ----- */
$('#saveCalendarBtn')?.addEventListener('click', (e)=>{
  e.preventDefault();

  const start = new Date(Date.UTC(2025,10,29,2,0,0));
  const end   = new Date(Date.UTC(2025,10,29,4,0,0));

  const pad = n => String(n).padStart(2,'0');
  const fmt = d => d.getUTCFullYear()+pad(d.getUTCMonth()+1)+pad(d.getUTCDate())
            +'T'+pad(d.getUTCHours())+pad(d.getUTCMinutes())+pad(d.getUTCSeconds())+'Z';

  const ics = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//WeniSyavic//Wedding//ID',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@wenisyavic`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    'SUMMARY:Akad Nikah - Weni & Syavic',
    'LOCATION:Desa Pulau Lebar, Rawas Ulu, Musi Rawas Utara',
    'DESCRIPTION:Doa dan restu Anda sangat berarti bagi kami.',
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], {type: 'text/calendar'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'Weni_Syavic_Akad.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

/* ----- Copy account ----- */
function showSnackbar(msg){
  const sn = $('#snackbar');
  sn.textContent = msg;
  sn.style.display = 'block';
  sn.setAttribute('aria-hidden','false');
  setTimeout(()=>{
    sn.style.display='none';
    sn.setAttribute('aria-hidden','true');
  },2500);
}

$$('.copy-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const t = $('#' + btn.dataset.target)?.textContent?.trim();
    if(t){
      navigator.clipboard.writeText(t)
        .then(()=> showSnackbar('Nomor rekening disalin: ' + t))
        .catch(()=>{ prompt('Salin nomor rekening:', t); });
    }
  });
});

/* ----- Wedding Wish ----- */
const WISH_KEY = 'wedding_wishes_v1';

function loadWishes(){
  const arr = JSON.parse(localStorage.getItem(WISH_KEY) || '[]');
  const list = $('#wishList');
  list.innerHTML = '';
  arr.slice().reverse().forEach(w=>{
    const d = document.createElement('div');
    d.className = 'wish-item';
    d.innerHTML = `
      <strong>${escapeHtml(w.name)}</strong>
      <div style="margin-top:6px">${escapeHtml(w.text)}</div>
      <div style="font-size:11px;color:#888;margin-top:8px">${new Date(w.t).toLocaleString()}</div>
    `;
    list.appendChild(d);
  });
}

function escapeHtml(s){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('

      /* ================
   Ambil nama undangan
================ */
const urlParams = new URLSearchParams(window.location.search);
const guestName = urlParams.get("to") || "Tamu Undangan";

document.getElementById("guestNameDisplay").textContent =
  "Untuk: " + guestName;

/* ================
   KONFIRMASI KEHADIRAN
================ */
document.querySelectorAll(".rsvp-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const status = btn.getAttribute("data-status");
    document.getElementById("rsvpResult").innerHTML =
      `<p><b>${guestName}</b> mengonfirmasi: <u>${status}</u>.</p>`;
  });
});

/* ================
   KIRIM UCAPAN & DOA
================ */
const wishSendBtn = document.getElementById("wishSend");
const wishList = document.getElementById("wishList");

wishSendBtn.addEventListener("click", () => {
  const text = document.getElementById("wishText").value.trim();

  if (!text) {
    alert("Tulis ucapan terlebih dahulu.");
    return;
  }

  const item = document.createElement("div");
  item.className = "item";
  item.innerHTML = `<b>${guestName}</b>: ${text}`;

  wishList.prepend(item);

  document.getElementById("wishText").value = "";
});

if (mode == "getWishes") {
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
}
function loadWishes() {
  fetch(WEBAPP_URL, {
    method: "POST",
    body: JSON.stringify({ mode: "getWishes" })
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("wishList");
    list.innerHTML = "";

    data.reverse().forEach(row => {
      const [date, name, message] = row;
      
      const item = document.createElement("div");
      item.className = "wish-item fade-in";
      item.innerHTML = `
        <strong>${name}</strong>
        <p>${message}</p>
      `;

      list.appendChild(item);
    });
  });
}

// panggil otomatis ketika section wish dibuka
document.addEventListener("DOMContentLoaded", loadWishes);
