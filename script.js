"use strict";

// Personaliza aquí la dedicatoria y el enlace de YouTube.
const regalo = {
  nombre: "[ESCRIBE AQUÍ SU NOMBRE]",
  firma: "[ESCRIBE AQUÍ TU NOMBRE]",
  mensaje: [
    "Hoy es tu día, mi princesa favorita.",
    "Me encanta cuando me cuentas cualquier cosita y terminamos riéndonos juntos.",
    "Quise hacerte esta tarjeta para que hoy también te saque una sonrisa."
  ],
  cancion: "https://www.youtube.com/watch?v=EM15crqoWb8",
  cancionFinal: "https://www.youtube.com/watch?v=IOhhe0mPn64&list=RDIOhhe0mPn64&start_radio=1"
};

const imagenLirio = "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1a/Witte_lelie_%28Lilium_candidum%29_Witte_Lelie._Lilium_album_Fleur_de_lys_blanche_%28titel_op_object%29%2C_RP-T-BR-2017-1-9-84.jpg/250px-Witte_lelie_%28Lilium_candidum%29_Witte_Lelie._Lilium_album_Fleur_de_lys_blanche_%28titel_op_object%29%2C_RP-T-BR-2017-1-9-84.jpg";
const cover = document.querySelector("#cover");
const card = document.querySelector("#card");
const title = document.querySelector("#card-title");
const message = document.querySelector("#message");
const openGift = document.querySelector("#open-gift");
const video = document.querySelector("#video");
const songLink = document.querySelector("#song-link");
const toggleMusic = document.querySelector("#toggle-music");
const musicStatus = document.querySelector("#music-status");
const surprise = document.querySelector("#surprise");
const surpriseNote = document.querySelector("#surprise-note");
const petals = document.querySelector("#petals");
const ambientPetals = document.querySelector("#ambient-petals");
const motionControl = document.querySelector("#motion-control");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPreference;

function updateMotion() {
  const enabled = motionPreference ?? !reducedMotion.matches;
  document.body.classList.toggle("motion-off", !enabled);
  motionControl.textContent = enabled ? "Pausar animaciones" : "Activar animaciones";
  if (!enabled) petals.replaceChildren();
}

motionControl.hidden = false;
motionControl.addEventListener("click", () => {
  motionPreference = document.body.classList.contains("motion-off");
  updateMotion();
  if (motionPreference) scatterPetals(18);
});
reducedMotion.addEventListener("change", updateMotion);
updateMotion();
document.querySelector("#final-song").href = regalo.cancionFinal;

const name = regalo.nombre.trim();
const signature = regalo.firma.trim();
title.textContent = name && name !== "[ESCRIBE AQUÍ SU NOMBRE]" ? `Para ${name}` : "Para mi princesa favorita";
document.querySelector("#signature").textContent = signature && signature !== "[ESCRIBE AQUÍ TU NOMBRE]"
  ? `Con cariño, ${signature}`
  : "Con todo mi cariño";

const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href = "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Quicksand:wght@500;600;700&display=swap";
document.head.append(fonts);
regalo.mensaje.forEach((line, index) => {
  const paragraph = document.createElement("p");
  paragraph.style.setProperty("--line", index);
  paragraph.textContent = line;
  message.append(paragraph);
});

document.querySelectorAll(".bloom img").forEach((image) => {
  image.addEventListener("load", () => {
    image.hidden = false;
  }, { once: true });
  image.src = imagenLirio;
});

function youtubeId(link) {
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    if (host === "youtu.be") return parts[0];
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      if (["embed", "shorts", "live"].includes(parts[0])) return parts[1];
      return url.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

let player;
let playbackTimer;
let hasPlayed = false;
let usingFallback = false;
const id = youtubeId(regalo.cancion);
const validSong = /^[\w-]{11}$/.test(id ?? "");
if (validSong) songLink.href = `https://www.youtube.com/watch?v=${id}`;

function showFallback() {
  clearTimeout(playbackTimer);
  if (usingFallback) return;
  usingFallback = true;
  player?.destroy?.();
  video.replaceChildren();
  video.hidden = true;
  toggleMusic.hidden = true;
  musicStatus.textContent = "";
  songLink.hidden = !validSong;
}

function startMusic() {
  if (!validSong) {
    musicStatus.textContent = "El enlace de la canción no es válido.";
    return;
  }
  if (location.protocol === "file:") {
    showFallback();
    return;
  }

  const params = new URLSearchParams({
    autoplay: "1",
    loop: "1",
    playlist: id,
    playsinline: "1",
    enablejsapi: "1"
  });
  if (location.origin !== "null") params.set("origin", location.origin);
  const frame = document.createElement("iframe");
  frame.title = "Reproductor de nuestra canción en YouTube";
  frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.src = `https://www.youtube.com/embed/${id}?${params}`;
  video.append(frame);
  video.hidden = false;
  video.inert = true;
  video.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  musicStatus.textContent = "Cargando nuestra canción…";
  playbackTimer = setTimeout(showFallback, 9000);

  window.onYouTubeIframeAPIReady = () => {
    if (usingFallback) return;
    player = new YT.Player(frame, {
      events: {
        onReady(event) {
          event.target.setVolume(22);
        },
        onStateChange(event) {
          if (event.data === YT.PlayerState.PLAYING) {
            clearTimeout(playbackTimer);
            hasPlayed = true;
            musicStatus.textContent = "";
            toggleMusic.hidden = false;
            toggleMusic.textContent = "Pausar";
            video.inert = false;
            video.removeAttribute("aria-hidden");
            video.querySelector("iframe")?.removeAttribute("tabindex");
          }
          if (event.data === YT.PlayerState.PAUSED && hasPlayed) {
            toggleMusic.textContent = "Reanudar";
          }
        },
        onAutoplayBlocked: showFallback,
        onError: showFallback
      }
    });
  };
  const api = document.createElement("script");
  api.src = "https://www.youtube.com/iframe_api";
  api.addEventListener("error", showFallback, { once: true });
  document.head.append(api);
}

toggleMusic.addEventListener("click", () => {
  if (!player || usingFallback) return;
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    playbackTimer = setTimeout(showFallback, 9000);
    player.playVideo();
  }
});

function scatterPetals(count, burst = false, ambient = false) {
  if (!ambient && document.body.classList.contains("motion-off")) return;
  const shower = document.createDocumentFragment();
  for (let index = 0; index < count; index++) {
    const petal = document.createElement("i");
    const x = burst ? Math.random() * 100 : (index % 2 ? 86 : 0) + Math.random() * 14;
    const duration = (burst ? 2.4 : 5.2) + Math.random() * 2;
    const delay = ambient ? -index * .78 : Math.random() * (burst ? .35 : 1.45);
    petal.className = "falling-petal";
    if (ambient) petal.classList.add("ambient-petal");
    if (burst && index % 4 === 0) {
      petal.classList.add("falling-heart");
      petal.textContent = "♥";
    }
    petal.style.setProperty("--x", `${x}%`);
    petal.style.setProperty("--size", `${9 + Math.random() * 13}px`);
    petal.style.setProperty("--duration", `${duration}s`);
    petal.style.setProperty("--delay", `${delay}s`);
    petal.style.setProperty("--drift", `${Math.random() * 100 - 50}px`);
    petal.style.setProperty("--spin", `${Math.random() * 630 - 315}deg`);
    if (!ambient) {
      petal.addEventListener("animationend", () => petal.remove(), { once: true });
      setTimeout(() => petal.remove(), (duration + delay) * 1000 + 200);
    }
    shower.append(petal);
  }
  (ambient ? ambientPetals : petals).append(shower);
}

scatterPetals(10, false, true);

openGift.addEventListener("click", () => {
  cover.classList.add("opening");
  startMusic();
  const reveal = () => {
    cover.hidden = true;
    card.hidden = false;
    title.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    scatterPetals(18);
  };
  if (document.body.classList.contains("motion-off")) reveal();
  else setTimeout(reveal, 1100);
}, { once: true });

surprise.addEventListener("click", () => {
  surpriseNote.hidden = false;
  surprise.setAttribute("aria-expanded", "true");
  document.querySelector("#surprise-label").textContent = "Otra lluvia de pétalos";
  petals.replaceChildren();
  scatterPetals(36, true);
  card.classList.remove("celebrating");
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add("celebrating")));
  const overflow = surpriseNote.offsetTop + surpriseNote.offsetHeight + card.offsetTop - window.scrollY - window.innerHeight;
  if (overflow > 0) window.scrollBy({ top: overflow + 24, behavior: document.body.classList.contains("motion-off") ? "instant" : "smooth" });
});
