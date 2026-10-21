"use strict";

/**
 * PIXELORA — Retro-Modern Photobooth Studio
 * Canvas rendering, camera MediaStream, progressive enhancement, Memory Roll gallery.
 */
(() => {
  /* ==========================================================================
     1. SCREEN AND ELEMENT REFERENCES
     ========================================================================== */
  const screens = {
    home: document.getElementById("screen-home"),
    capture: document.getElementById("screen-capture"),
    downloading: document.getElementById("screen-downloading"),
    done: document.getElementById("screen-done"),
    gallery: document.getElementById("screen-gallery"),
  };

  const el = {
    // Navigation and core screens
    start: document.getElementById("btnStart"),
    navStudio: document.getElementById("btnNavStudio"),
    navPrint: document.getElementById("navPrint"),
    home: document.getElementById("btnHome"),
    brandHome: document.getElementById("brandHome"),
    homeError: document.getElementById("homeError"),

    // Camera and capture
    video: document.getElementById("video"),
    cameraStage: document.getElementById("cameraStage"),
    cameraPlaceholder: document.getElementById("cameraPlaceholder"),
    cameraStatus: document.getElementById("cameraStatus"),
    cameraMeta: document.getElementById("cameraMeta"),
    cameraClickSound: document.getElementById("cameraClickSound"),
    countdown: document.getElementById("countdown"),
    flash: document.getElementById("cameraFlash"),
    switchCamera: document.getElementById("btnSwitchCamera"),
    filterSelect: document.getElementById("filter-select"),
    capture: document.getElementById("btnCapture"),
    captureText: document.getElementById("captureButtonText"),
    retake: document.getElementById("btnRetake"),
    download: document.getElementById("btnDownload"),

    // Counters and progress
    shotCounter: document.getElementById("shotCounter"),
    progressCount: document.getElementById("progressCount"),
    progressSlotsContainer: document.querySelector(".progress-slots"),
    progressSlots: [1, 2, 3, 4]
      .map((n) => document.getElementById(`progress${n}`))
      .filter(Boolean),

    // Templates
    stripPreview: document.getElementById("stripPreview"),
    stripOut: document.getElementById("stripOut"),
    stripFinal: document.getElementById("stripFinal"),
    templateName: document.getElementById("templateName"),
    templateCounter: document.getElementById("templateCounter"),
    prevTemplate: document.getElementById("btnPrevTpl"),
    nextTemplate: document.getElementById("btnNextTpl"),
    templateButtons: [...document.querySelectorAll("[data-template]")],

    // Canvas
    canvas: document.getElementById("canvas"),

    // Feature 1: Countdown timer buttons (3s, 5s, 10s)
    timerButtons: [...document.querySelectorAll("[data-timer]")],

    // Feature 2: Frame count buttons (1, 2, 3, 4)
    frameCountButtons: [...document.querySelectorAll("[data-frames]")],

    // Feature 3: Surprise button
    btnSurprise: document.getElementById("btnSurprise"),

    // Feature 4: Memory Roll gallery elements
    galleryGrid: document.getElementById("galleryGrid"),
    galleryEmpty: document.getElementById("galleryEmpty"),
    btnNavGallery: document.getElementById("btnNavGallery"),
    btnBackFromGallery: document.getElementById("btnBackFromGallery"),
    btnGalleryStart: document.getElementById("btnGalleryStart"),
    btnSaveToGallery: document.getElementById("btnSaveToGallery"),
    btnGoGallery: document.getElementById("btnGoGallery"),

    // Feature 5: Web Share API button
    btnShare: document.getElementById("btnShare"),

    // Booth selection cards
    boothCards: [...document.querySelectorAll("[data-booth]")],

    // Viewfinder tools
    btnSoundToggle: document.getElementById("btnSoundToggle"),
    btnGridToggle: document.getElementById("btnGridToggle"),
    btnMirrorToggle: document.getElementById("btnMirrorToggle"),
    viewfinderGrid: document.getElementById("viewfinderGrid"),
    viewfinderDuoGuide: document.getElementById("viewfinderDuoGuide"),

    // Pose guide
    poseGuideCard: document.getElementById("poseGuideCard"),
    poseText: document.getElementById("poseText"),
    btnNextPose: document.getElementById("btnNextPose"),

    // Personalization Lab
    btnTogglePersonalize: document.getElementById("btnTogglePersonalize"),
    personalizeContent: document.getElementById("personalizeContent"),
    customCaptionInput: document.getElementById("customCaptionInput"),
    customDateInput: document.getElementById("customDateInput"),
    grainCheckbox: document.getElementById("grainCheckbox"),
    stickerChips: [...document.querySelectorAll("[data-sticker]")],

    // Done screen actions
    btnCopyImage: document.getElementById("btnCopyImage"),
    btnEditStrip: document.getElementById("btnEditStrip"),
    doneMetaText: document.getElementById("doneMetaText"),
  };

  const ctx = el.canvas ? el.canvas.getContext("2d", { alpha: false }) : null;

  /* ==========================================================================
     2. CONSTANTS AND CONFIGURATION
     ========================================================================== */
  const STRIP_W = 360;
  const COUNTDOWN_SECONDS = 3;
  const GALLERY_STORAGE_KEY = "pixelora_gallery";
  const MAX_GALLERY_ITEMS = 20;

  // Frame count configurations for variable layout heights and slots
  const FRAME_CONFIGS = {
    1: {
      stripH: 600,
      slotH: 300,
      slotY: [440],
    },
    2: {
      stripH: 850,
      slotH: 250,
      slotY: [280, 580],
    },
    3: {
      stripH: 1080,
      slotH: 225,
      slotY: [200, 445, 690],
    },
    4: {
      stripH: 1200,
      slotH: 195,
      slotY: [170, 385, 600, 815],
    },
  };

  const THEMES = [
    {
      name: "01 — CLASSIC FILM",
      title: "GOOD TIMES",
      subtitle: "A LITTLE FILM OF TODAY",
      footer: "KEEP THIS ONE.",
      paper: "#f5e9d2",
      ink: "#733944",
      muted: "#b77e6a",
      blank: "#e8d7ba",
      accent: "#d1a755",
      hole: "#d2bfa1",
      sticker: "✳",
    },
    {
      name: "02 — SWEET MEMORY",
      title: "SWEET MEMORY",
      subtitle: "LITTLE THINGS, BIG FEELINGS",
      footer: "MADE WITH LOVE.",
      paper: "#f0d9d5",
      ink: "#6c4151",
      muted: "#bf8585",
      blank: "#e4c5c1",
      accent: "#9a6574",
      hole: "#d3aaa8",
      sticker: "♡",
    },
    {
      name: "03 — SUNDAY CLUB",
      title: "SUNDAY CLUB",
      subtitle: "SOMEWHERE IN OUR YOUTH",
      footer: "JUST GOOD VIBES.",
      paper: "#e2e4d0",
      ink: "#3c5142",
      muted: "#7a8b69",
      blank: "#ced5bc",
      accent: "#c79f4d",
      hole: "#bdc7aa",
      sticker: "✦",
    },
    {
      name: "04 — CITRUS PICNIC",
      title: "CITRUS PICNIC",
      subtitle: "SQUEEZE THE DAY",
      footer: "SWEET AS TODAY.",
      paper: "#f5e8c9",
      ink: "#76503a",
      muted: "#bd805b",
      blank: "#e9d7ae",
      accent: "#cc9b42",
      hole: "#d8c296",
      sticker: "✿",
      frameStyle: "rounded",
      ornament: "dots",
    },
    {
      name: "05 — SOFT ARCHIVE",
      title: "SOFT ARCHIVE",
      subtitle: "A NOTE TO REMEMBER",
      footer: "FILED WITH LOVE.",
      paper: "#e9dfd1",
      ink: "#584a52",
      muted: "#9a7a75",
      blank: "#d8cabe",
      accent: "#b58373",
      hole: "#cabaa8",
      sticker: "⌂",
      frameStyle: "arch",
      ornament: "lines",
    },
    {
      name: "06 — LITTLE LUNA",
      title: "LITTLE LUNA",
      subtitle: "UNDER THE SAME MOON",
      footer: "MEET ME IN A MEMORY.",
      paper: "#e6e0d8",
      ink: "#454b59",
      muted: "#788195",
      blank: "#d0ccd0",
      accent: "#c7a66d",
      hole: "#c9c1b7",
      sticker: "☾",
      frameStyle: "oval",
      ornament: "stars",
    },
    {
      name: "07 — SUNDAY TICKET",
      title: "SUNDAY TICKET",
      subtitle: "ADMIT ONE: GOOD TIMES",
      footer: "VALID FOR A GOOD DAY.",
      paper: "#eee0d0",
      ink: "#75443e",
      muted: "#ae7660",
      blank: "#dfcbbb",
      accent: "#ba8a48",
      hole: "#d1b9a7",
      sticker: "✂",
      frameStyle: "ticket",
      ornament: "ticket",
    },
    {
      name: "08 — POSTCARD CLUB",
      title: "POSTCARD CLUB",
      subtitle: "WISH YOU WERE HERE",
      footer: "SENT FROM TODAY.",
      paper: "#e2e8e2",
      ink: "#405d59",
      muted: "#6f8a80",
      blank: "#cbd9d2",
      accent: "#bd9760",
      hole: "#bdcec5",
      sticker: "✉",
      frameStyle: "hexagon",
      ornament: "postmark",
    },
    {
      name: "09 — BLOOM ROOM",
      title: "BLOOM ROOM",
      subtitle: "LET THE MOMENT FLOWER",
      footer: "GROWING IN GOOD COMPANY.",
      paper: "#f0dfdc",
      ink: "#764857",
      muted: "#b17880",
      blank: "#e0c9cb",
      accent: "#c6a05a",
      hole: "#d8bbbf",
      sticker: "❀",
      frameStyle: "scallop",
      ornament: "petals",
    },
    {
      name: "10 — AFTER HOURS",
      title: "AFTER HOURS",
      subtitle: "ONE MORE FOR THE ROAD",
      footer: "THE NIGHT IS STILL YOUNG.",
      paper: "#e4ddd1",
      ink: "#3e4541",
      muted: "#788174",
      blank: "#c9c8bd",
      accent: "#c39a5b",
      hole: "#c7bdac",
      sticker: "✦",
      frameStyle: "slant",
      ornament: "midnight",
    },
    {
      name: "11 — PRISMATIC",
      title: "PRISMATIC",
      subtitle: "CATCH A DIFFERENT LIGHT",
      footer: "COLOR OUTSIDE THE LINES.",
      paper: "#e8e1d4",
      ink: "#294e57",
      muted: "#668c89",
      blank: "#c7d7d0",
      accent: "#d27e57",
      hole: "#c3b7a4",
      sticker: "◇",
      frameStyle: "diamond",
      ornament: "prism",
    },
    {
      name: "12 — CONTACT SHEET",
      title: "CONTACT SHEET",
      subtitle: "EVERY FRAME HAS A STORY",
      footer: "ROLL 012 · KEEP DEVELOPING.",
      paper: "#303735",
      ink: "#f2e8cf",
      muted: "#b7c3a0",
      blank: "#59615a",
      accent: "#d0aa5a",
      hole: "#a8b29f",
      sticker: "▣",
      frameStyle: "film",
      ornament: "perforation",
    },
    {
      name: "13 — TIDAL FORM",
      title: "TIDAL FORM",
      subtitle: "A LITTLE OUT OF THE BLUE",
      footer: "STAY CLOSE TO THE SEA.",
      paper: "#dce9e4",
      ink: "#28586a",
      muted: "#5c8e91",
      blank: "#b9d5d1",
      accent: "#df926b",
      hole: "#b3cbc6",
      sticker: "≈",
      frameStyle: "wave",
      ornament: "tide",
    },
    {
      name: "14 — SOFT SIGNAL",
      title: "SOFT SIGNAL",
      subtitle: "YOU ARE HERE, RIGHT NOW",
      footer: "GOOD THINGS COME THROUGH.",
      paper: "#d9e2dd",
      ink: "#324c49",
      muted: "#7d958a",
      blank: "#bfcec5",
      accent: "#d27556",
      hole: "#aebdb2",
      sticker: "⌁",
      frameStyle: "capsule",
      ornament: "signal",
    },
    {
      name: "15 — CUT PAPER",
      title: "CUT PAPER",
      subtitle: "MADE BY HAND, KEPT BY HEART",
      footer: "ONE OF A KIND, LIKE YOU.",
      paper: "#f0dfc4",
      ink: "#75473e",
      muted: "#b4775c",
      blank: "#e3c8a5",
      accent: "#4d7865",
      hole: "#d1b899",
      sticker: "✂",
      frameStyle: "bracket",
      ornament: "corners",
    },
    {
      name: "16 — ORBIT ROOM",
      title: "ORBIT ROOM",
      subtitle: "SOMEWHERE IN OUR UNIVERSE",
      footer: "STAY IN EACH OTHER'S ORBIT.",
      paper: "#e5e1d7",
      ink: "#3e4b62",
      muted: "#71829a",
      blank: "#cbd0d3",
      accent: "#bd895b",
      hole: "#c2c2bd",
      sticker: "◉",
      frameStyle: "clover",
      ornament: "orbit",
    },
    {
      name: "17 — CLOVER CLUB",
      title: "CLOVER CLUB",
      subtitle: "A LITTLE LUCK, A LOT OF LOVE",
      footer: "GOOD DAYS GROW HERE.",
      paper: "#e3e9d8",
      ink: "#3e5b43",
      muted: "#77916d",
      blank: "#cbd8bf",
      accent: "#c07b59",
      hole: "#bfcbb4",
      sticker: "♧",
      frameStyle: "trapezoid",
      ornament: "sprout",
    },
    {
      name: "18 — SOUNDWAVE",
      title: "SOUNDWAVE",
      subtitle: "TURN THIS MOMENT UP",
      footer: "PLAY IT BACK FOREVER.",
      paper: "#e8dcd2",
      ink: "#59414b",
      muted: "#a26f70",
      blank: "#d8c5bd",
      accent: "#c18d4b",
      hole: "#cdbbb0",
      sticker: "♫",
      frameStyle: "burst",
      ornament: "soundwave",
    },
  ];

  /* ==========================================================================
     3. STATE VARIABLES
     ========================================================================== */
  const templateAssets = new Map();
  let stream = null;
  let facingMode = "user";
  let currentTemplate = 0;
  let maxFrames = 3;
  let countdownSeconds = COUNTDOWN_SECONDS;

  let STRIP_H = FRAME_CONFIGS[3].stripH;
  const SLOT = {
    x: 30,
    w: 300,
    h: FRAME_CONFIGS[3].slotH,
    y: [...FRAME_CONFIGS[3].slotY],
  };

  let photos = new Array(maxFrames).fill(null);
  let isBusy = false;
  let sessionActive = false;
  let currentToastTimeout = null;

  // New interactive feature state
  let isSoundEnabled = localStorage.getItem("pixelora_sound") !== "false";
  let gridMode = 0; // 0 = off, 1 = rule of thirds, 2 = duo silhouette
  let isMirrored = true;
  let userCaption = "";
  let userDate = "";
  let selectedSticker = null;
  let isGrainEnabled = true;
  let activeBoothMode = "classic";
  let currentPoseIndex = 0;

  const POSE_SUGGESTIONS = [
    "Frame 01: Wink & classic peace sign ✌️",
    "Frame 02: Candid laugh & head tilt 😄",
    "Frame 03: Cheek poke or heart hands ♡",
    "Frame 04: Over the shoulder look ✨",
    "Frame 05: Cool sunglasses / chin touch 😎",
    "Frame 06: Sharing a secret with bestie 🤫",
    "Frame 07: High fashion editorial stare ✦",
    "Frame 08: Double victory & big smile ✌️😄",
    "Frame 09: Hugging or leaning shoulders together 👯",
    "Frame 10: Funny face or tongue out 🤪",
  ];

  /* ==========================================================================
     4. UTILITY FUNCTIONS
     ========================================================================== */
  const pause = (ms) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

  /**
   * Generates a procedural analog film grain overlay on canvas.
   */
  function applyFilmGrain(context, width, height) {
    if (!isGrainEnabled) return;
    try {
      const gCanvas = document.createElement("canvas");
      gCanvas.width = 100;
      gCanvas.height = 100;
      const gCtx = gCanvas.getContext("2d");
      const imgData = gCtx.createImageData(100, 100);
      const buf = imgData.data;
      for (let i = 0; i < buf.length; i += 4) {
        const val = (Math.random() * 255) | 0;
        buf[i] = val;
        buf[i + 1] = val;
        buf[i + 2] = val;
        buf[i + 3] = 16; // Subtle ~6% opacity
      }
      gCtx.putImageData(imgData, 0, 0);
      context.save();
      context.globalCompositeOperation = "overlay";
      const pat = context.createPattern(gCanvas, "repeat");
      if (pat) {
        context.fillStyle = pat;
        context.fillRect(0, 0, width, height);
      }
      context.restore();
    } catch (e) {
      console.warn("Grain effect skipped:", e);
    }
  }

  const completedCount = () => photos.filter(Boolean).length;

  /**
   * Helper to determine divider line Y positions between slots
   * for template ornament flourishes.
   */
  function getFrameDividers() {
    if (maxFrames === 1) return [];
    if (maxFrames === 3) return [425, 670];
    const dividers = [];
    for (let i = 0; i < maxFrames - 1; i += 1) {
      const y1 = (SLOT.y[i] || 0) + SLOT.h;
      const y2 = SLOT.y[i + 1] || y1;
      dividers.push(Math.round((y1 + y2) / 2));
    }
    return dividers;
  }

  /* ==========================================================================
     5. UI UPDATE FUNCTIONS
     ========================================================================== */
  function showScreen(name) {
    Object.entries(screens).forEach(([key, node]) => {
      if (!node) return;
      const isTarget = key === name;
      node.classList.toggle("hidden", !isTarget);
      node.setAttribute("aria-hidden", !isTarget ? "true" : "false");
    });

    if (el.navStudio) el.navStudio.classList.toggle("hidden", name !== "home");
    if (el.navPrint) el.navPrint.classList.toggle("hidden", name !== "home");
    if (el.btnNavGallery) {
      el.btnNavGallery.classList.toggle("hidden", name !== "home");
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function setStatus(message, kind = "normal") {
    if (!el.cameraStatus) return;
    el.cameraStatus.textContent = message;
    el.cameraStatus.dataset.kind = kind;
  }

  function showHomeError(message) {
    if (!el.homeError) return;
    el.homeError.textContent = message;
    el.homeError.classList.remove("hidden");
  }

  function hideHomeError() {
    if (!el.homeError) return;
    el.homeError.textContent = "";
    el.homeError.classList.add("hidden");
  }

  /**
   * Dynamically build progress slot pills based on maxFrames.
   */
  function updateProgressSlotsDOM() {
    const container =
      el.progressSlotsContainer || document.querySelector(".progress-slots");
    if (!container) return;

    container.innerHTML = "";
    el.progressSlots = [];
    for (let i = 1; i <= maxFrames; i += 1) {
      const span = document.createElement("span");
      span.className = "progress-slot";
      span.id = `progress${i}`;
      span.textContent = String(i).padStart(2, "0");
      container.appendChild(span);
      el.progressSlots.push(span);
    }
  }

  function updateUI() {
    const count = completedCount();
    const isFull = count === maxFrames;

    if (el.shotCounter) {
      el.shotCounter.textContent = `FRAME ${String(Math.min(count + 1, maxFrames)).padStart(2, "0")} / ${String(maxFrames).padStart(2, "0")}`;
    }

    if (el.captureText) {
      el.captureText.textContent = isFull
        ? "ALL FRAMES CAPTURED"
        : `TAKE PHOTO ${String(count + 1).padStart(2, "0")} / ${String(maxFrames).padStart(2, "0")}`;
    }

    if (el.progressCount) {
      el.progressCount.textContent = `${count} OF ${maxFrames}`;
    }

    if (el.progressSlots && el.progressSlots.length) {
      el.progressSlots.forEach((slot, index) => {
        if (!slot) return;
        slot.classList.toggle("is-filled", Boolean(photos[index]));
        slot.setAttribute(
          "aria-label",
          `Frame ${index + 1}${photos[index] ? ", sudah terisi" : ", kosong"}`,
        );
      });
    }

    if (el.capture) el.capture.disabled = isBusy || isFull || !stream;
    if (el.navStudio) el.navStudio.disabled = isBusy;
    if (el.filterSelect) el.filterSelect.disabled = isBusy;
    if (el.download) el.download.disabled = isBusy || !isFull;
    if (el.retake) el.retake.disabled = isBusy || count === 0;
    if (el.prevTemplate) el.prevTemplate.disabled = isBusy;
    if (el.nextTemplate) el.nextTemplate.disabled = isBusy;
    if (el.switchCamera) el.switchCamera.disabled = isBusy || !stream;
    if (el.btnSurprise) el.btnSurprise.disabled = isBusy;
    if (el.btnShare) el.btnShare.disabled = isBusy || !isFull;
    if (el.btnSaveToGallery) el.btnSaveToGallery.disabled = isBusy || !isFull;

    el.templateButtons.forEach((button, index) => {
      const active = index === currentTemplate;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    el.timerButtons.forEach((button) => {
      const active = Number(button.dataset.timer) === countdownSeconds;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    el.frameCountButtons.forEach((button) => {
      const active = Number(button.dataset.frames) === maxFrames;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setCountdownSeconds(seconds) {
    if (isBusy) return;
    const parsed = Number(seconds);
    if (!parsed || parsed <= 0) return;
    countdownSeconds = parsed;
    updateUI();
  }

  function setFrameCount(newFrames) {
    const targetFrames = Number(newFrames);
    if (
      isBusy ||
      !Number.isInteger(targetFrames) ||
      targetFrames === maxFrames
    ) {
      return;
    }
    if (targetFrames < 1 || targetFrames > 4) return;

    const count = completedCount();
    if (targetFrames < count) {
      const removedCount = count - targetFrames;
      const keepGoing = window.confirm(
        `Mengubah ke ${targetFrames} frame akan menghapus ${removedCount} foto terakhir. Lanjutkan?`,
      );
      if (!keepGoing) return;
    }

    const previousPhotos = photos;
    maxFrames = targetFrames;
    const config = FRAME_CONFIGS[maxFrames] || FRAME_CONFIGS[3];
    STRIP_H = config.stripH;
    SLOT.h = config.slotH;
    SLOT.y = [...config.slotY];

    photos = Array.from(
      { length: maxFrames },
      (_, index) => previousPhotos[index] || null,
    );

    updateProgressSlotsDOM();
    drawStrip();
    updateUI();
  }

  /* ==========================================================================
     6. CAMERA FUNCTIONS
     ========================================================================== */
  async function startCamera() {
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      throw new Error(
        "Browser ini belum mendukung akses kamera. Buka halaman melalui HTTPS atau localhost menggunakan Chrome, Safari, atau Edge versi terbaru.",
      );
    }

    stopCamera();
    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 960 },
      },
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    try {
      if (el.video) el.video.srcObject = stream;

      const trackFacingMode = stream
        .getVideoTracks()[0]
        ?.getSettings().facingMode;
      if (trackFacingMode === "user" || trackFacingMode === "environment") {
        facingMode = trackFacingMode;
      }
      if (el.video) {
        el.video.style.transform =
          facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
      }

      if (el.video) await el.video.play();

      if (el.video && !el.video.videoWidth) {
        await new Promise((resolve, reject) => {
          const onMetadata = () => {
            window.clearTimeout(timeout);
            resolve();
          };
          const timeout = window.setTimeout(() => {
            el.video.removeEventListener("loadedmetadata", onMetadata);
            reject(
              new Error(
                "Preview kamera tidak merespons. Coba ganti kamera atau muat ulang halaman.",
              ),
            );
          }, 8000);
          el.video.addEventListener("loadedmetadata", onMetadata, {
            once: true,
          });
        });
      }

      sessionActive = true;
      if (el.cameraPlaceholder) el.cameraPlaceholder.classList.add("hidden");
      if (el.cameraMeta) {
        el.cameraMeta.textContent =
          facingMode === "user" ? "CAM 01 · FRONT" : "CAM 02 · REAR";
      }
      setStatus("Kamera aktif. Atur pose, lalu tekan TAKE PHOTO.", "success");
      updateUI();
    } catch (error) {
      stopCamera();
      if (el.cameraPlaceholder) {
        el.cameraPlaceholder.classList.remove("hidden");
      }
      if (
        error instanceof Error &&
        (error.name === "NotAllowedError" ||
          error.message.startsWith("Preview kamera tidak merespons."))
      ) {
        throw error;
      }
      throw new Error(
        "Kamera terdeteksi, tetapi preview gagal dimulai. Muat ulang halaman dan izinkan kamera.",
      );
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (el.video) el.video.srcObject = null;
    sessionActive = false;
  }

  async function switchCamera() {
    if (isBusy || !stream) return;
    const previousFacing = facingMode;
    const requestedFacing = facingMode === "user" ? "environment" : "user";
    facingMode = requestedFacing;
    if (el.switchCamera) el.switchCamera.disabled = true;
    setStatus("Mengganti kamera…");
    try {
      await startCamera();
      if (facingMode !== requestedFacing) {
        const unavailable =
          requestedFacing === "environment" ? "belakang" : "depan";
        const active = facingMode === "environment" ? "belakang" : "depan";
        setStatus(
          `Kamera ${unavailable} tidak tersedia. Kamera ${active} tetap aktif.`,
          "error",
        );
      }
    } catch (error) {
      facingMode = previousFacing;
      try {
        await startCamera();
      } catch (restoreError) {
        console.error("Camera restore error:", restoreError);
        stopCamera();
        if (el.cameraPlaceholder) {
          el.cameraPlaceholder.classList.remove("hidden");
        }
        setStatus(
          "Kamera gagal diganti dan kamera sebelumnya tidak dapat dipulihkan. Muat ulang halaman dan izinkan kamera.",
          "error",
        );
        return;
      }
      setStatus(
        `Kamera ${requestedFacing === "environment" ? "belakang" : "depan"} tidak tersedia. Kamera sebelumnya dipertahankan.`,
        "error",
      );
    } finally {
      updateUI();
    }
  }

  /* ==========================================================================
     7. CANVAS DRAWING FUNCTIONS
     ========================================================================== */
  function roundedRectPath(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function drawCover(context, image, x, y, width, height) {
    const iw = image.width || image.videoWidth;
    const ih = image.height || image.videoHeight;
    if (!iw || !ih) return;
    const scale = Math.max(width / iw, height / ih);
    const sw = width / scale;
    const sh = height / scale;
    const sx = (iw - sw) / 2;
    const sy = (ih - sh) / 2;
    context.drawImage(image, sx, sy, sw, sh, x, y, width, height);
  }

  function drawFilmHoles(theme) {
    ctx.fillStyle = theme.hole;
    for (let y = 18; y < STRIP_H - 18; y += 24) {
      roundedRectPath(ctx, 10, y, 5, 10, 2);
      ctx.fill();
      roundedRectPath(ctx, STRIP_W - 15, y, 5, 10, 2);
      ctx.fill();
    }
  }

  function drawBase(theme) {
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, STRIP_W, STRIP_H);
    ctx.strokeStyle = theme.hole;
    ctx.lineWidth = 1;
    ctx.strokeRect(20.5, 20.5, STRIP_W - 41, STRIP_H - 41);
    drawFilmHoles(theme);

    ctx.textAlign = "center";
    ctx.fillStyle = theme.ink;
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText(theme.title, STRIP_W / 2, 77, 285);
    ctx.fillStyle = theme.muted;
    ctx.font = "9px monospace";
    ctx.letterSpacing = "1px";
    ctx.fillText(theme.subtitle, STRIP_W / 2, 105, 290);

    const activeSticker = selectedSticker || theme.sticker;
    ctx.fillStyle = theme.accent;
    ctx.font = "20px Georgia, serif";
    ctx.fillText(activeSticker, STRIP_W / 2, 145);
    ctx.strokeStyle = theme.hole;
    ctx.beginPath();
    ctx.moveTo(70, 164);
    ctx.lineTo(290, 164);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = theme.ink;
    ctx.font = "bold 11px monospace";
    ctx.fillText(userCaption || theme.footer, STRIP_W / 2, STRIP_H - 94, 280);
    ctx.fillStyle = theme.muted;
    ctx.font = "8px monospace";
    ctx.fillText(
      userDate || "PIXELORA STUDIO · 2026",
      STRIP_W / 2,
      STRIP_H - 70,
      280,
    );
    ctx.fillStyle = theme.accent;
    ctx.font = "17px Georgia, serif";
    ctx.fillText(activeSticker, STRIP_W / 2, STRIP_H - 40);
    if (theme.frameStyle) drawTemplateOrnaments(theme);
  }

  function drawTemplateOrnaments(theme) {
    ctx.save();
    ctx.fillStyle = theme.accent;
    ctx.strokeStyle = theme.hole;
    ctx.globalAlpha = 0.8;
    const bottomLineY = STRIP_H - 122;
    const dividers = getFrameDividers();

    if (theme.ornament === "prism") {
      dividers.forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(STRIP_W / 2, y - 8);
        ctx.lineTo(STRIP_W / 2 + 8, y);
        ctx.lineTo(STRIP_W / 2, y + 8);
        ctx.lineTo(STRIP_W / 2 - 8, y);
        ctx.closePath();
        ctx.stroke();
        ctx.fillText("✧", 56, y + 4);
        ctx.fillText("✧", 304, y + 4);
      });
    } else if (theme.ornament === "perforation") {
      dividers.forEach((y) => {
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.moveTo(68, y);
        ctx.lineTo(292, y);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let x = 48; x <= 312; x += 16) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    } else if (theme.ornament === "tide") {
      dividers.forEach((y) => {
        for (let offset = -5; offset <= 5; offset += 5) {
          ctx.beginPath();
          ctx.moveTo(76, y + offset);
          ctx.bezierCurveTo(
            112,
            y - 8 + offset,
            148,
            y + 8 + offset,
            180,
            y + offset,
          );
          ctx.bezierCurveTo(
            212,
            y - 8 + offset,
            248,
            y + 8 + offset,
            284,
            y + offset,
          );
          ctx.stroke();
        }
      });
    } else if (theme.ornament === "signal") {
      dividers.forEach((y) => {
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(58, y);
        ctx.lineTo(302, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(STRIP_W / 2, y, 8, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(STRIP_W / 2, y, 14, Math.PI, Math.PI * 2);
        ctx.stroke();
      });
    } else if (theme.ornament === "corners") {
      SLOT.y.forEach((slotY) => {
        const mark = 14;
        [
          [36, slotY + 8, 1, 1],
          [324, slotY + 8, -1, 1],
          [36, slotY + SLOT.h - 8, 1, -1],
          [324, slotY + SLOT.h - 8, -1, -1],
        ].forEach(([x, y, directionX, directionY]) => {
          ctx.beginPath();
          ctx.moveTo(x + directionX * mark, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y + directionY * mark);
          ctx.stroke();
        });
      });
    } else if (theme.ornament === "orbit") {
      dividers.forEach((y) => {
        ctx.beginPath();
        ctx.ellipse(STRIP_W / 2, y, 25, 8, -0.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(STRIP_W / 2 + 23, y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (theme.ornament === "sprout") {
      dividers.forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(STRIP_W / 2, y + 8);
        ctx.lineTo(STRIP_W / 2, y - 6);
        ctx.moveTo(STRIP_W / 2, y + 1);
        ctx.quadraticCurveTo(STRIP_W / 2 - 5, y - 8, STRIP_W / 2 - 12, y - 5);
        ctx.moveTo(STRIP_W / 2, y - 2);
        ctx.quadraticCurveTo(STRIP_W / 2 + 5, y - 11, STRIP_W / 2 + 12, y - 8);
        ctx.stroke();
      });
    } else if (theme.ornament === "soundwave") {
      dividers.forEach((y) => {
        const heights = [4, 9, 14, 7, 11, 5, 13, 8, 4];
        heights.forEach((height, index) => {
          const x = STRIP_W / 2 + (index - 4) * 9;
          ctx.beginPath();
          ctx.moveTo(x, y - height / 2);
          ctx.lineTo(x, y + height / 2);
          ctx.stroke();
        });
      });
    } else if (theme.ornament === "dots") {
      for (let x = 82; x <= 278; x += 14) {
        ctx.beginPath();
        ctx.arc(x, 164, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.arc(x, bottomLineY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme.ornament === "lines") {
      dividers.forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(55, y);
        ctx.lineTo(305, y);
        ctx.stroke();
        ctx.font = "13px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("⌂", STRIP_W / 2, y + 4);
      });
    } else if (theme.ornament === "stars" || theme.ornament === "midnight") {
      dividers.forEach((y) => {
        ctx.font = "16px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(
          theme.ornament === "stars" ? "✦" : "✧",
          STRIP_W / 2,
          y + 5,
        );
        ctx.beginPath();
        ctx.arc(48, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.arc(312, y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (theme.ornament === "ticket") {
      dividers.forEach((y) => {
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(48, y);
        ctx.lineTo(312, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("ADMIT ONE", STRIP_W / 2, y - 5);
      });
    } else if (theme.ornament === "postmark") {
      [44, 316].forEach((x) => {
        ctx.beginPath();
        ctx.arc(x, 144, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "12px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("✉", x, 148);
      });
      dividers.forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(70, y);
        ctx.lineTo(290, y);
        ctx.stroke();
      });
    } else {
      dividers.forEach((y) => {
        ctx.font = "15px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(
          theme.ornament === "petals" ? "❀" : theme.sticker,
          STRIP_W / 2,
          y + 5,
        );
        ctx.beginPath();
        ctx.moveTo(63, y);
        ctx.lineTo(116, y);
        ctx.moveTo(244, y);
        ctx.lineTo(297, y);
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  function drawEmptySlot(theme, index, x, y) {
    ctx.fillStyle = theme.blank;
    ctx.fillRect(x, y, SLOT.w, SLOT.h);
    ctx.strokeStyle = "rgba(75, 55, 39, .13)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x + 9.5, y + 9.5, SLOT.w - 19, SLOT.h - 19);
    ctx.setLineDash([]);

    ctx.textAlign = "center";
    ctx.fillStyle = theme.ink;
    ctx.globalAlpha = 0.55;
    ctx.font = "29px Georgia, serif";
    ctx.fillText(
      selectedSticker || "✳",
      x + SLOT.w / 2,
      y + Math.round(SLOT.h * 0.408),
    );
    ctx.font = "bold 10px monospace";
    ctx.fillText(
      `YOUR PHOTO ${String(index + 1).padStart(2, "0")}`,
      x + SLOT.w / 2,
      y + Math.round(SLOT.h * 0.564),
    );
    ctx.font = "8px monospace";
    ctx.fillText(
      "A MOMENT GOES HERE",
      x + SLOT.w / 2,
      y + Math.round(SLOT.h * 0.644),
    );
    ctx.globalAlpha = 1;
  }

  function tracePhotoFrame(context, style, x, y, width, height) {
    context.beginPath();
    if (style === "rounded") {
      roundedRectPath(context, x, y, width, height, 20);
    } else if (style === "arch") {
      const radius = width / 2;
      context.moveTo(x, y + height);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height);
      context.closePath();
    } else if (style === "oval") {
      context.ellipse(
        x + width / 2,
        y + height / 2,
        width / 2,
        height / 2,
        0,
        0,
        Math.PI * 2,
      );
    } else if (style === "ticket") {
      const notch = 13;
      context.moveTo(x + notch, y);
      context.lineTo(x + width - notch, y);
      context.arcTo(x + width, y, x + width, y + notch, notch);
      context.lineTo(x + width, y + height / 2 - notch);
      context.arc(
        x + width,
        y + height / 2,
        notch,
        -Math.PI / 2,
        Math.PI / 2,
        true,
      );
      context.lineTo(x + width, y + height - notch);
      context.arcTo(
        x + width,
        y + height,
        x + width - notch,
        y + height,
        notch,
      );
      context.lineTo(x + notch, y + height);
      context.arcTo(x, y + height, x, y + height - notch, notch);
      context.lineTo(x, y + height / 2 + notch);
      context.arc(x, y + height / 2, notch, Math.PI / 2, -Math.PI / 2, true);
      context.lineTo(x, y + notch);
      context.arcTo(x, y, x + notch, y, notch);
      context.closePath();
    } else if (style === "hexagon") {
      context.moveTo(x + width * 0.18, y);
      context.lineTo(x + width * 0.82, y);
      context.lineTo(x + width, y + height * 0.5);
      context.lineTo(x + width * 0.82, y + height);
      context.lineTo(x + width * 0.18, y + height);
      context.lineTo(x, y + height * 0.5);
      context.closePath();
    } else if (style === "scallop") {
      const lobes = 8;
      const points = [];
      for (let i = 0; i < lobes * 4; i += 1) {
        const angle = -Math.PI / 2 + (i * Math.PI * 2) / (lobes * 4);
        const radius = i % 2 === 0 ? 0.5 : 0.47;
        points.push({
          x: x + width / 2 + Math.cos(angle) * width * radius,
          y: y + height / 2 + Math.sin(angle) * height * radius,
        });
      }
      context.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.closePath();
    } else if (style === "slant") {
      context.moveTo(x + width * 0.08, y);
      context.lineTo(x + width, y);
      context.lineTo(x + width * 0.92, y + height);
      context.lineTo(x, y + height);
      context.closePath();
    } else if (style === "diamond") {
      context.moveTo(x + width / 2, y);
      context.lineTo(x + width, y + height / 2);
      context.lineTo(x + width / 2, y + height);
      context.lineTo(x, y + height / 2);
      context.closePath();
    } else if (style === "film") {
      const notch = Math.min(12, height * 0.12);
      context.moveTo(x + notch, y);
      context.lineTo(x + width - notch, y);
      context.lineTo(x + width, y + notch);
      context.lineTo(x + width, y + height - notch);
      context.lineTo(x + width - notch, y + height);
      context.lineTo(x + notch, y + height);
      context.lineTo(x, y + height - notch);
      context.lineTo(x, y + notch);
      context.closePath();
    } else if (style === "wave") {
      context.moveTo(x, y + height * 0.12);
      context.bezierCurveTo(
        x + width * 0.25,
        y - height * 0.08,
        x + width * 0.25,
        y + height * 0.28,
        x + width / 2,
        y + height * 0.12,
      );
      context.bezierCurveTo(
        x + width * 0.75,
        y - height * 0.08,
        x + width * 0.75,
        y + height * 0.28,
        x + width,
        y + height * 0.12,
      );
      context.lineTo(x + width, y + height * 0.88);
      context.bezierCurveTo(
        x + width * 0.75,
        y + height * 1.08,
        x + width * 0.75,
        y + height * 0.72,
        x + width / 2,
        y + height * 0.88,
      );
      context.bezierCurveTo(
        x + width * 0.25,
        y + height * 1.08,
        x + width * 0.25,
        y + height * 0.72,
        x,
        y + height * 0.88,
      );
      context.closePath();
    } else if (style === "capsule") {
      roundedRectPath(context, x, y, width, height, height / 2);
    } else if (style === "bracket") {
      const cut = Math.min(24, height * 0.2);
      context.moveTo(x + cut, y);
      context.lineTo(x + width - cut, y);
      context.lineTo(x + width, y + cut);
      context.lineTo(x + width, y + height - cut);
      context.lineTo(x + width - cut, y + height);
      context.lineTo(x + cut, y + height);
      context.lineTo(x, y + height - cut);
      context.lineTo(x, y + cut);
      context.closePath();
    } else if (style === "clover") {
      context.moveTo(x + width / 2, y + height * 0.08);
      context.quadraticCurveTo(
        x + width * 0.8,
        y + height * 0.06,
        x + width * 0.8,
        y + height * 0.3,
      );
      context.quadraticCurveTo(
        x + width * 0.98,
        y + height / 2,
        x + width * 0.8,
        y + height * 0.7,
      );
      context.quadraticCurveTo(
        x + width * 0.8,
        y + height * 0.94,
        x + width / 2,
        y + height * 0.92,
      );
      context.quadraticCurveTo(
        x + width * 0.2,
        y + height * 0.94,
        x + width * 0.2,
        y + height * 0.7,
      );
      context.quadraticCurveTo(
        x + width * 0.02,
        y + height / 2,
        x + width * 0.2,
        y + height * 0.3,
      );
      context.quadraticCurveTo(
        x + width * 0.2,
        y + height * 0.06,
        x + width / 2,
        y + height * 0.08,
      );
      context.closePath();
    } else if (style === "trapezoid") {
      context.moveTo(x + width * 0.14, y);
      context.lineTo(x + width * 0.86, y);
      context.lineTo(x + width, y + height);
      context.lineTo(x, y + height);
      context.closePath();
    } else if (style === "burst") {
      for (let point = 0; point < 16; point += 1) {
        const angle = -Math.PI / 2 + (point * Math.PI) / 8;
        const radius = point % 2 === 0 ? 0.5 : 0.44;
        const pointX = x + width / 2 + Math.cos(angle) * width * radius;
        const pointY = y + height / 2 + Math.sin(angle) * height * radius;
        if (point === 0) context.moveTo(pointX, pointY);
        else context.lineTo(pointX, pointY);
      }
      context.closePath();
    } else {
      context.rect(x, y, width, height);
    }
  }

  function drawStyledSlot(photo, index, theme, x, y) {
    const padding = theme.frameStyle === "oval" ? 7 : 0;
    const frameX = x + padding;
    const frameY = y + padding;
    const frameWidth = SLOT.w - padding * 2;
    const frameHeight = SLOT.h - padding * 2;

    ctx.save();
    tracePhotoFrame(
      ctx,
      theme.frameStyle,
      frameX,
      frameY,
      frameWidth,
      frameHeight,
    );
    ctx.clip();
    if (photo) {
      drawCover(ctx, photo, frameX, frameY, frameWidth, frameHeight);
      ctx.fillStyle = "rgba(255, 255, 255, .035)";
      ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
    } else {
      ctx.fillStyle = theme.blank;
      ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
      ctx.textAlign = "center";
      ctx.fillStyle = theme.ink;
      ctx.globalAlpha = 0.58;
      ctx.font = "28px Georgia, serif";
      ctx.fillText(
        selectedSticker || theme.sticker,
        x + SLOT.w / 2,
        y + Math.round(SLOT.h * 0.418),
      );
      ctx.font = "bold 10px monospace";
      ctx.fillText(
        `YOUR PHOTO ${String(index + 1).padStart(2, "0")}`,
        x + SLOT.w / 2,
        y + Math.round(SLOT.h * 0.573),
      );
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    ctx.save();
    tracePhotoFrame(
      ctx,
      theme.frameStyle,
      frameX,
      frameY,
      frameWidth,
      frameHeight,
    );
    ctx.strokeStyle = theme.paper;
    ctx.lineWidth = 7;
    ctx.stroke();
    tracePhotoFrame(
      ctx,
      theme.frameStyle,
      frameX,
      frameY,
      frameWidth,
      frameHeight,
    );
    ctx.strokeStyle = theme.ink;
    ctx.globalAlpha = 0.46;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function createTemplateOverlay(image, theme) {
    if (!theme.transparentPhotoOpenings) return null;

    const overlay = document.createElement("canvas");
    overlay.width = image.naturalWidth;
    overlay.height = image.naturalHeight;
    const overlayContext = overlay.getContext("2d");
    overlayContext.drawImage(image, 0, 0);

    const imageData = overlayContext.getImageData(
      0,
      0,
      overlay.width,
      overlay.height,
    );
    const pixels = imageData.data;
    theme.photoSlots.forEach((slot) => {
      const left = Math.max(0, Math.floor(slot.x));
      const top = Math.max(0, Math.floor(slot.y));
      const right = Math.min(overlay.width, Math.ceil(slot.x + slot.width));
      const bottom = Math.min(overlay.height, Math.ceil(slot.y + slot.height));
      for (let y = top; y < bottom; y += 1) {
        for (let x = left; x < right; x += 1) {
          const offset = (y * overlay.width + x) * 4;
          if (
            pixels[offset] > 210 &&
            pixels[offset + 1] > 210 &&
            pixels[offset + 2] > 210
          ) {
            pixels[offset + 3] = 0;
          }
        }
      }
    });
    overlayContext.putImageData(imageData, 0, 0);
    return overlay;
  }

  function loadTemplateAssets() {
    THEMES.forEach((theme) => {
      if (!theme.asset) return;

      const image = new Image();
      const asset = { image, overlay: null, loaded: false };
      templateAssets.set(theme.asset, asset);
      image.onload = () => {
        asset.overlay = createTemplateOverlay(image, theme);
        asset.loaded = true;
        drawStrip();
      };
      image.onerror = () => {
        console.error(`Template artwork could not be loaded: ${theme.asset}`);
        drawStrip();
      };
      image.src = new URL(
        encodeURIComponent(theme.asset),
        window.location.href,
      ).href;
    });
  }

  function getAssetPhotoSlots(theme) {
    if (maxFrames !== 4 || theme.photoSlots.length !== 3) {
      return theme.photoSlots;
    }

    const lastSlot = theme.photoSlots[2];
    const divider = 8;
    const halfHeight = (lastSlot.height - divider) / 2;
    return [
      theme.photoSlots[0],
      theme.photoSlots[1],
      { ...lastSlot, height: halfHeight },
      {
        ...lastSlot,
        y: lastSlot.y + halfHeight + divider,
        height: halfHeight,
      },
    ];
  }

  function drawAssetTemplate(theme, asset) {
    const { crop } = theme;
    const scale = Math.min(STRIP_W / crop.width, STRIP_H / crop.height);
    const width = crop.width * scale;
    const height = crop.height * scale;
    const x = (STRIP_W - width) / 2;
    const y = (STRIP_H - height) / 2;

    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, STRIP_W, STRIP_H);
    if (!asset || !asset.loaded) {
      drawBase(theme);
      return;
    }

    ctx.drawImage(
      asset.image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      x,
      y,
      width,
      height,
    );

    getAssetPhotoSlots(theme).forEach((slot, index) => {
      if (index >= maxFrames) return;
      const photo = photos[index];
      if (!photo) return;
      const photoX = x + (slot.x - crop.x) * scale;
      const photoY = y + (slot.y - crop.y) * scale;
      const photoWidth = slot.width * scale;
      const photoHeight = slot.height * scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(photoX, photoY, photoWidth, photoHeight);
      ctx.clip();
      drawCover(ctx, photo, photoX, photoY, photoWidth, photoHeight);
      ctx.restore();
    });

    if (asset.overlay) {
      ctx.drawImage(
        asset.overlay,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        x,
        y,
        width,
        height,
      );
    }
    if (isGrainEnabled) {
      applyFilmGrain(ctx, STRIP_W, STRIP_H);
    }
  }

  function drawStrip() {
    if (!ctx || !el.canvas) return null;
    const theme = THEMES[currentTemplate];
    el.canvas.width = STRIP_W;
    el.canvas.height = STRIP_H;
    ctx.clearRect(0, 0, STRIP_W, STRIP_H);

    if (theme.asset) {
      drawAssetTemplate(theme, templateAssets.get(theme.asset));
      const dataUrl = el.canvas.toDataURL("image/png");
      if (el.stripPreview) el.stripPreview.src = dataUrl;
      if (el.stripOut) el.stripOut.src = dataUrl;
      if (el.stripFinal) el.stripFinal.src = dataUrl;
      if (el.templateName) el.templateName.textContent = theme.name;
      if (el.templateCounter) {
        el.templateCounter.textContent = `${String(currentTemplate + 1).padStart(2, "0")} / ${String(THEMES.length).padStart(2, "0")}`;
      }
      return dataUrl;
    }

    drawBase(theme);

    for (let index = 0; index < maxFrames; index += 1) {
      const photo = photos[index];
      const x = SLOT.x;
      const y = SLOT.y[index];

      if (theme.frameStyle) {
        drawStyledSlot(photo, index, theme, x, y);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, SLOT.w, SLOT.h);
      ctx.clip();
      if (photo) {
        drawCover(ctx, photo, x, y, SLOT.w, SLOT.h);
        // A restrained analog-film tint, without hiding the actual photo.
        ctx.fillStyle =
          currentTemplate === 1
            ? "rgba(202, 119, 126, .08)"
            : currentTemplate === 2
              ? "rgba(103, 126, 87, .08)"
              : "rgba(218, 171, 98, .05)";
        ctx.fillRect(x, y, SLOT.w, SLOT.h);
      } else {
        drawEmptySlot(theme, index, x, y);
      }
      ctx.restore();

      ctx.strokeStyle = theme.paper;
      ctx.lineWidth = 5;
      ctx.strokeRect(x + 1.5, y + 1.5, SLOT.w - 3, SLOT.h - 3);
      ctx.strokeStyle = theme.ink;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, SLOT.w, SLOT.h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = theme.ink;
      ctx.font = "8px monospace";
      ctx.textAlign = "left";
      ctx.fillText(String(index + 1).padStart(2, "0"), x + 6, y + SLOT.h - 7);
    }

    // Top-level registration marks and subtle decoration.
    if (!theme.frameStyle) {
      ctx.fillStyle = theme.accent;
      ctx.font = "13px Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("✳", 36, 36);
      ctx.textAlign = "right";
      ctx.fillText("✳", STRIP_W - 36, 36);
      ctx.strokeStyle = theme.hole;
      ctx.beginPath();
      ctx.moveTo(42, STRIP_H - 122);
      ctx.lineTo(318, STRIP_H - 122);
      ctx.stroke();
    }

    if (isGrainEnabled) {
      applyFilmGrain(ctx, STRIP_W, STRIP_H);
    }

    const dataUrl = el.canvas.toDataURL("image/png");
    if (el.stripPreview) el.stripPreview.src = dataUrl;
    if (el.stripOut) el.stripOut.src = dataUrl;
    if (el.stripFinal) el.stripFinal.src = dataUrl;
    if (el.templateName) el.templateName.textContent = theme.name;
    if (el.templateCounter) {
      el.templateCounter.textContent = `${String(currentTemplate + 1).padStart(2, "0")} / ${String(THEMES.length).padStart(2, "0")}`;
    }
    return dataUrl;
  }

  /* ==========================================================================
     8. TEMPLATE FUNCTIONS
     ========================================================================== */
  function chooseTemplate(index) {
    if (isBusy) return;
    currentTemplate = (index + THEMES.length) % THEMES.length;
    drawStrip();
    updateUI();
  }

  /* ==========================================================================
     9. PHOTO CAPTURE FUNCTIONS
     ========================================================================== */
  async function runCountdown() {
    if (!el.countdown) return;
    el.countdown.classList.remove("hidden");
    for (let remaining = countdownSeconds; remaining > 0; remaining -= 1) {
      el.countdown.textContent = String(remaining);
      // Re-trigger pop animation for every digit.
      el.countdown.style.animation = "none";
      void el.countdown.offsetWidth;
      el.countdown.style.animation = "";
      await pause(850);
    }
    el.countdown.textContent = "✳";
    await pause(180);
    el.countdown.classList.add("hidden");
  }

  function playCameraClickSound() {
    if (!isSoundEnabled || !el.cameraClickSound) return;
    el.cameraClickSound.currentTime = 0;
    void el.cameraClickSound.play().catch((error) => {
      console.warn("Camera click sound error:", error);
    });
  }

  function applyFilterFallback(context, canvas, filterValue) {
    const operations = [...filterValue.matchAll(/([a-z-]+)\(([^)]+)\)/g)].map(
      ([, name, value]) => ({
        name,
        value: value.trim(),
      }),
    );
    if (!operations.length) return;

    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = image.data;
    const clamp = (value) => Math.max(0, Math.min(255, value));
    const amount = (value) => {
      const number = parseFloat(value);
      return value.endsWith("%") ? number / 100 : number;
    };

    for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];

      operations.forEach(({ name, value }) => {
        const strength = amount(value);
        const oldR = r;
        const oldG = g;
        const oldB = b;

        switch (name) {
          case "grayscale": {
            const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            r = oldR * (1 - strength) + gray * strength;
            g = oldG * (1 - strength) + gray * strength;
            b = oldB * (1 - strength) + gray * strength;
            break;
          }
          case "sepia": {
            const sepiaR = 0.393 * oldR + 0.769 * oldG + 0.189 * oldB;
            const sepiaG = 0.349 * oldR + 0.686 * oldG + 0.168 * oldB;
            const sepiaB = 0.272 * oldR + 0.534 * oldG + 0.131 * oldB;
            r = oldR * (1 - strength) + sepiaR * strength;
            g = oldG * (1 - strength) + sepiaG * strength;
            b = oldB * (1 - strength) + sepiaB * strength;
            break;
          }
          case "invert":
            r = oldR * (1 - strength) + (255 - oldR) * strength;
            g = oldG * (1 - strength) + (255 - oldG) * strength;
            b = oldB * (1 - strength) + (255 - oldB) * strength;
            break;
          case "brightness":
            r = oldR * strength;
            g = oldG * strength;
            b = oldB * strength;
            break;
          case "contrast":
            r = (oldR - 127.5) * strength + 127.5;
            g = (oldG - 127.5) * strength + 127.5;
            b = (oldB - 127.5) * strength + 127.5;
            break;
          case "saturate":
            r =
              (0.213 + 0.787 * strength) * oldR +
              (0.715 - 0.715 * strength) * oldG +
              (0.072 - 0.072 * strength) * oldB;
            g =
              (0.213 - 0.213 * strength) * oldR +
              (0.715 + 0.285 * strength) * oldG +
              (0.072 - 0.072 * strength) * oldB;
            b =
              (0.213 - 0.213 * strength) * oldR +
              (0.715 - 0.715 * strength) * oldG +
              (0.072 + 0.928 * strength) * oldB;
            break;
          default:
            break;
        }

        r = clamp(r);
        g = clamp(g);
        b = clamp(b);
      });

      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
    }
    context.putImageData(image, 0, 0);
  }

  function captureFrame() {
    if (!el.video || !el.video.videoWidth || !el.video.videoHeight) {
      throw new Error(
        "Preview kamera belum siap. Tunggu sampai gambar kamera terlihat, lalu coba lagi.",
      );
    }
    const photo = document.createElement("canvas");
    photo.width = el.video.videoWidth;
    photo.height = el.video.videoHeight;
    const photoContext = photo.getContext("2d");
    const filter = el.filterSelect ? el.filterSelect.value : "none";
    const supportsCanvasFilter = "filter" in photoContext;
    photoContext.save();
    if (supportsCanvasFilter) photoContext.filter = filter;
    if (facingMode === "user" && isMirrored) {
      photoContext.translate(photo.width, 0);
      photoContext.scale(-1, 1);
    }
    photoContext.drawImage(el.video, 0, 0, photo.width, photo.height);
    photoContext.restore();
    if (!supportsCanvasFilter && filter !== "none") {
      applyFilterFallback(photoContext, photo, filter);
    }
    return photo;
  }

  async function takePhoto() {
    const index = completedCount();
    if (isBusy || index >= maxFrames || !stream) return;

    isBusy = true;
    updateUI();
    setStatus(`Bersiap untuk frame ${index + 1}. Senyum dulu…`);

    try {
      await runCountdown();
      playCameraClickSound();
      if (navigator.vibrate) {
        try {
          navigator.vibrate([35, 20, 35]);
        } catch (vErr) {
          // Ignore vibration error
        }
      }
      photos[index] = captureFrame();
      updatePoseGuide(index + 1);
      if (el.flash) {
        el.flash.classList.remove("flash");
        void el.flash.offsetWidth;
        el.flash.classList.add("flash");
      }
      drawStrip();
      setStatus(
        `Frame ${index + 1} tersimpan. ${index < maxFrames - 1 ? "Lanjutkan untuk mengambil foto berikutnya." : "Semua frame lengkap — photostrip siap disimpan."}`,
        "success",
      );
    } catch (error) {
      console.error("Capture error:", error);
      setStatus(
        error instanceof Error
          ? error.message
          : "Foto gagal diambil. Coba lagi.",
        "error",
      );
    } finally {
      isBusy = false;
      updateUI();
    }
  }

  function retakeLastPhoto() {
    if (isBusy) return;
    const count = completedCount();
    if (!count) return;
    photos[count - 1] = null;
    updatePoseGuide(count - 1);
    drawStrip();
    updateUI();
    setStatus(
      `Frame ${count} dihapus. Tekan TAKE PHOTO untuk mengambil ulang.`,
      "normal",
    );
  }

  async function beginSession() {
    if (isBusy) return;
    hideHomeError();
    if (el.start) el.start.disabled = true;
    if (el.navStudio) el.navStudio.disabled = true;
    showScreen("capture");
    if (el.cameraPlaceholder) el.cameraPlaceholder.classList.remove("hidden");
    setStatus("Meminta izin kamera…");
    drawStrip();
    updateUI();

    try {
      await startCamera();
    } catch (error) {
      console.error("Camera error:", error);
      const message =
        error && error.name === "NotAllowedError"
          ? "Izin kamera ditolak. Izinkan kamera pada pengaturan situs di browser, lalu tekan Start lagi."
          : error && error.name === "NotFoundError"
            ? "Kamera tidak ditemukan. Hubungkan atau aktifkan kamera, kemudian coba lagi."
            : error && error.name === "NotReadableError"
              ? "Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut lalu coba lagi."
              : error instanceof Error
                ? error.message
                : "Kamera tidak bisa dibuka. Coba muat ulang halaman.";
      setStatus(message, "error");
      showScreen("home");
      showHomeError(message);
    } finally {
      if (el.start) el.start.disabled = false;
      if (el.navStudio) el.navStudio.disabled = false;
      updateUI();
    }
  }

  function resetSession() {
    stopCamera();
    photos = new Array(maxFrames).fill(null);
    isBusy = false;
    if (el.countdown) el.countdown.classList.add("hidden");
    if (el.cameraPlaceholder) el.cameraPlaceholder.classList.remove("hidden");
    setStatus("Tekan tombol mulai untuk mengaktifkan kamera.");
    if (el.cameraMeta) el.cameraMeta.textContent = "CAM 01 · READY";
    drawStrip();
    updateUI();
    showScreen("home");
  }

  /* ==========================================================================
     10. GALLERY FUNCTIONS (MEMORY ROLL)
     ========================================================================== */
  function loadGallery() {
    try {
      const data = localStorage.getItem(GALLERY_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load gallery from localStorage:", error);
      return [];
    }
  }

  function saveGalleryData(items) {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error("Failed to save gallery to localStorage:", error);
      showToast(
        "Penyimpanan galeri penuh. Tidak dapat menyimpan foto baru.",
        3500,
      );
      return false;
    }
  }

  function saveToGallery() {
    if (completedCount() !== maxFrames) {
      showToast("Lengkapi semua frame foto terlebih dahulu!");
      return;
    }
    const dataUrl = drawStrip();
    if (!dataUrl) return;

    const gallery = loadGallery();
    if (gallery.length >= MAX_GALLERY_ITEMS) {
      gallery.shift(); // remove oldest entry
      showToast("Memory Roll penuh (maks 20). Foto tertua digantikan.", 2800);
    }

    const now = new Date();
    const dateFormatted = now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      dataUrl,
      template: THEMES[currentTemplate].name,
      date: dateFormatted,
      frameCount: maxFrames,
    };

    gallery.push(entry);
    if (!saveGalleryData(gallery)) return;
    showToast("Saved to Memory Roll!");
  }

  function deleteFromGallery(id) {
    const confirmDelete = window.confirm(
      "Hapus photostrip ini dari Memory Roll?",
    );
    if (!confirmDelete) return;

    let gallery = loadGallery();
    gallery = gallery.filter((item) => item.id !== id);
    saveGalleryData(gallery);
    renderGallery();
    showToast("Photostrip dihapus dari galeri.");
  }

  function downloadFromGallery(id) {
    const gallery = loadGallery();
    const item = gallery.find((entry) => entry.id === id);
    if (!item) return;

    const link = document.createElement("a");
    const date = new Date();
    const stamp = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
      "-",
      item.id,
    ].join("");
    link.href = item.dataUrl;
    link.download = `pixelora-strip-${stamp}.png`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("Mengunduh foto dari Memory Roll…");
  }

  function renderGallery() {
    if (!el.galleryGrid) return;
    const gallery = loadGallery();
    el.galleryGrid.innerHTML = "";

    if (gallery.length === 0) {
      if (el.galleryEmpty) el.galleryEmpty.classList.remove("hidden");
      el.galleryGrid.classList.add("hidden");
      return;
    }

    if (el.galleryEmpty) el.galleryEmpty.classList.add("hidden");
    el.galleryGrid.classList.remove("hidden");

    // Display newest items first
    const reversed = [...gallery].reverse();
    reversed.forEach((item) => {
      const card = document.createElement("div");
      card.className = "gallery-card";
      card.dataset.id = item.id;

      const thumbnail = document.createElement("img");
      thumbnail.className = "gallery-card-thumb";
      thumbnail.src = item.dataUrl;
      thumbnail.alt = `Photostrip ${item.template}`;
      thumbnail.loading = "lazy";

      const thumbWrap = document.createElement("div");
      thumbWrap.className = "gallery-card-thumb-wrap";
      thumbWrap.appendChild(thumbnail);

      const info = document.createElement("div");
      info.className = "gallery-card-info";
      const template = document.createElement("span");
      template.className = "gallery-card-template";
      template.textContent = item.template;
      const meta = document.createElement("span");
      meta.className = "gallery-card-meta";
      meta.textContent = `${item.date} · ${item.frameCount} FRAMES`;
      info.append(template, meta);

      const actions = document.createElement("div");
      actions.className = "gallery-card-actions";
      const btnDownload = document.createElement("button");
      btnDownload.type = "button";
      btnDownload.className = "button button-soft gallery-download-btn";
      btnDownload.title = "Download photostrip";
      btnDownload.textContent = "DOWNLOAD";
      btnDownload.addEventListener("click", () => downloadFromGallery(item.id));
      const btnDelete = document.createElement("button");
      btnDelete.type = "button";
      btnDelete.className = "button button-soft gallery-delete-btn";
      btnDelete.title = "Hapus dari galeri";
      btnDelete.textContent = "HAPUS";
      btnDelete.addEventListener("click", () => deleteFromGallery(item.id));
      actions.append(btnDownload, btnDelete);

      card.append(thumbWrap, info, actions);

      el.galleryGrid.appendChild(card);
    });
  }

  /* ==========================================================================
     11. SHARE / DOWNLOAD FUNCTIONS
     ========================================================================== */
  function downloadCanvas() {
    return new Promise((resolve, reject) => {
      if (!el.canvas) {
        reject(new Error("Canvas tidak ditemukan."));
        return;
      }
      el.canvas.toBlob((blob) => {
        if (!blob) {
          reject(
            new Error(
              "Browser gagal membuat file foto. Coba gunakan browser terbaru.",
            ),
          );
          return;
        }
        resolve(blob);
      }, "image/png");
    });
  }

  function triggerDownload(blob) {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date();
    const stamp = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("");
    link.href = objectUrl;
    link.download = `pixelora-strip-${stamp}.png`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  }

  async function sharePhotostrip() {
    if (isBusy || completedCount() !== maxFrames) return;
    try {
      const blob = await downloadCanvas();
      const file = new File([blob], "pixelora-strip.png", {
        type: "image/png",
      });

      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          files: [file],
          title: "PIXELORA Strip",
          text: "Check out my photostrip from PIXELORA STUDIO!",
        });
        showToast("Shared successfully!");
      } else {
        // Fall back to direct download if Web Share API with files is unsupported
        triggerDownload(blob);
        showToast("Browser tidak mendukung web share, foto diunduh.");
      }
    } catch (error) {
      if (error && error.name === "AbortError") {
        // User dismissed share dialog - no action required
        return;
      }
      console.warn("Share failed, falling back to download:", error);
      try {
        const fallbackBlob = await downloadCanvas();
        triggerDownload(fallbackBlob);
        showToast("Gagal membagikan, foto berhasil diunduh.");
      } catch (fallbackError) {
        showToast("Gagal membagikan atau mengunduh foto.", 3000);
      }
    }
  }

  async function printAndSave() {
    if (isBusy || completedCount() !== maxFrames) return;
    isBusy = true;
    updateUI();
    drawStrip();
    showScreen("downloading");
    stopCamera();

    try {
      const blob = await downloadCanvas();
      if (el.stripOut) {
        el.stripOut.classList.remove("play");
        void el.stripOut.offsetWidth;
        el.stripOut.classList.add("play");
      }
      await pause(1850);
      triggerDownload(blob);
      showScreen("done");
    } catch (error) {
      console.error("Download error:", error);
      showScreen("capture");
      setStatus(
        error instanceof Error
          ? `${error.message} Foto masih tersimpan di preview.`
          : "Download gagal. Coba lagi.",
        "error",
      );
    } finally {
      isBusy = false;
      updateUI();
    }
  }

  /* ==========================================================================
     12. TOAST FUNCTIONS
     ========================================================================== */
  function ensureToastStyles() {
    if (document.getElementById("pixelora-toast-styles")) return;
    const style = document.createElement("style");
    style.id = "pixelora-toast-styles";
    style.textContent = `
      .toast {
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%) translateY(16px);
        background: var(--ink, #28251f);
        color: var(--paper, #f4eee2);
        padding: 12px 24px;
        border-radius: 999px;
        font-family: var(--mono, "Courier New", monospace);
        font-size: 11px;
        letter-spacing: 0.08em;
        box-shadow: 0 10px 32px rgba(40, 37, 31, 0.28);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
        z-index: 99999;
      }
      .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
        pointer-events: auto;
      }
      .surprise-active {
        transform: scale(1.08) rotate(-2deg) !important;
        transition: transform 0.2s ease !important;
      }
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 20px;
        margin-top: 24px;
      }
      .gallery-card {
        background: var(--paper-light, #fffaf1);
        border: 1px solid var(--line, #d8cdbb);
        border-radius: 6px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 4px 14px rgba(49, 37, 27, 0.06);
      }
      .gallery-card-thumb-wrap {
        display: flex;
        justify-content: center;
        background: var(--paper-shade, #e8decd);
        border-radius: 4px;
        overflow: hidden;
      }
      .gallery-card-thumb {
        max-height: 240px;
        object-fit: contain;
      }
      .gallery-card-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .gallery-card-template {
        font-family: var(--mono, "Courier New", monospace);
        font-size: 10px;
        font-weight: bold;
        letter-spacing: 0.05em;
        color: var(--ink, #28251f);
      }
      .gallery-card-meta {
        font-family: var(--mono, "Courier New", monospace);
        font-size: 8px;
        color: var(--muted, #817769);
      }
      .gallery-card-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-top: auto;
      }
      .gallery-card-actions button {
        padding: 6px 4px;
        font-size: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  function showToast(message, duration = 3000) {
    ensureToastStyles();
    if (currentToastTimeout) {
      clearTimeout(currentToastTimeout);
      currentToastTimeout = null;
    }

    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    currentToastTimeout = window.setTimeout(() => {
      toast.classList.remove("show");
      window.setTimeout(() => {
        toast.remove();
      }, 300);
      currentToastTimeout = null;
    }, duration);
  }

  /* ==========================================================================
     13. SURPRISE MODE
     ========================================================================== */
  function handleSurprise() {
    if (isBusy) return;

    const randomIndex = (length) => Math.floor(Math.random() * length);
    currentTemplate = randomIndex(THEMES.length);

    if (el.filterSelect && el.filterSelect.options.length > 0) {
      el.filterSelect.selectedIndex = randomIndex(
        el.filterSelect.options.length,
      );
      if (el.video) el.video.style.filter = el.filterSelect.value;
    }

    const timerValues = el.timerButtons.map((button) =>
      Number(button.dataset.timer),
    );
    if (timerValues.length) {
      setCountdownSeconds(timerValues[randomIndex(timerValues.length)]);
    }

    const frameValues = el.frameCountButtons.map((button) =>
      Number(button.dataset.frames),
    );
    const hasCapturedPhotos = completedCount() > 0;
    if (!hasCapturedPhotos && frameValues.length) {
      const availableFrames = frameValues.filter(
        (frameCount) => frameCount !== maxFrames,
      );
      if (availableFrames.length) {
        setFrameCount(availableFrames[randomIndex(availableFrames.length)]);
      }
    }

    // 3 & 4. Visual feedback
    if (el.btnSurprise) {
      el.btnSurprise.classList.add("surprise-active");
      window.setTimeout(() => {
        el.btnSurprise?.classList.remove("surprise-active");
      }, 600);
    }

    drawStrip();
    updateUI();
    showToast(
      hasCapturedPhotos
        ? "Surprise look and timer applied. Your captured frames are safe!"
        : "Surprise look, timer, and strip length applied!",
    );
  }

  /* ==========================================================================
     14. EVENT LISTENERS
     ========================================================================== */
  el.start?.addEventListener("click", beginSession);
  el.navStudio?.addEventListener("click", beginSession);
  el.filterSelect?.addEventListener("change", () => {
    if (el.video && el.filterSelect) {
      el.video.style.filter = el.filterSelect.value;
    }
  });
  el.capture?.addEventListener("click", takePhoto);
  el.download?.addEventListener("click", printAndSave);
  el.retake?.addEventListener("click", retakeLastPhoto);

  el.prevTemplate?.addEventListener("click", () =>
    chooseTemplate(currentTemplate - 1),
  );
  el.nextTemplate?.addEventListener("click", () =>
    chooseTemplate(currentTemplate + 1),
  );

  el.templateButtons.forEach((button) => {
    button.addEventListener("click", () =>
      chooseTemplate(Number(button.dataset.template)),
    );
  });

  el.home?.addEventListener("click", resetSession);
  el.switchCamera?.addEventListener("click", switchCamera);

  // Feature 1: Timer buttons
  el.timerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCountdownSeconds(button.dataset.timer);
    });
  });

  // Feature 2: Frame count buttons
  el.frameCountButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFrameCount(button.dataset.frames);
    });
  });

  // Feature 3: Surprise button
  el.btnSurprise?.addEventListener("click", handleSurprise);

  // Feature 4: Memory Roll gallery buttons
  el.btnNavGallery?.addEventListener("click", () => {
    showScreen("gallery");
    renderGallery();
  });
  el.btnBackFromGallery?.addEventListener("click", () => {
    showScreen("home");
  });
  el.btnGalleryStart?.addEventListener("click", () => {
    beginSession();
  });
  el.btnSaveToGallery?.addEventListener("click", () => {
    saveToGallery();
  });
  el.btnGoGallery?.addEventListener("click", () => {
    showScreen("gallery");
    renderGallery();
  });

  // Feature 5: Web Share API button
  el.btnShare?.addEventListener("click", sharePhotostrip);

  /* ==========================================================================
     NEW FEATURES: BOOTH MODES, TOOLS, PERSONALIZATION, CLIPBOARD
     ========================================================================== */
  function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem("pixelora_sound", String(isSoundEnabled));
    if (el.btnSoundToggle) {
      el.btnSoundToggle.textContent = isSoundEnabled ? "🔊" : "🔇";
      el.btnSoundToggle.title = isSoundEnabled
        ? "Suara Shutter: Nyala"
        : "Suara Shutter: Senyap";
      el.btnSoundToggle.classList.toggle("is-active", !isSoundEnabled);
    }
    showToast(
      isSoundEnabled ? "Suara kamera aktif 🔊" : "Kamera dalam mode senyap 🔇",
    );
  }

  function cycleGridMode() {
    gridMode = (gridMode + 1) % 3;
    if (el.viewfinderGrid)
      el.viewfinderGrid.classList.toggle("hidden", gridMode !== 1);
    if (el.viewfinderDuoGuide)
      el.viewfinderDuoGuide.classList.toggle("hidden", gridMode !== 2);
    if (el.btnGridToggle) {
      el.btnGridToggle.textContent =
        gridMode === 0 ? "⊞" : gridMode === 1 ? "▦" : "👥";
      el.btnGridToggle.classList.toggle("is-active", gridMode !== 0);
      el.btnGridToggle.title =
        gridMode === 0
          ? "Panduan Komposisi: Mati"
          : gridMode === 1
            ? "Panduan: Rule of Thirds"
            : "Panduan: Duo & Friends";
    }
    showToast(
      gridMode === 0
        ? "Panduan grid dimatikan"
        : gridMode === 1
          ? "Garis komposisi 3x3 aktif"
          : "Panduan Duo & Bestie aktif 👥",
    );
  }

  function toggleMirror() {
    isMirrored = !isMirrored;
    if (el.video && facingMode === "user") {
      el.video.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
    }
    if (el.btnMirrorToggle) {
      el.btnMirrorToggle.classList.toggle("is-active", isMirrored);
      el.btnMirrorToggle.title = isMirrored
        ? "Mirror Kamera: Aktif"
        : "Mirror Kamera: Asli";
    }
    showToast(isMirrored ? "Mirror selfie aktif ⇄" : "Tampilan kamera asli");
  }

  function updatePoseGuide(index) {
    if (typeof index === "number")
      currentPoseIndex =
        (index + POSE_SUGGESTIONS.length) % POSE_SUGGESTIONS.length;
    else currentPoseIndex = (currentPoseIndex + 1) % POSE_SUGGESTIONS.length;
    if (el.poseText) {
      el.poseText.textContent = POSE_SUGGESTIONS[currentPoseIndex];
    }
  }

  function selectBoothMode(mode) {
    activeBoothMode = mode;
    el.boothCards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.booth === mode);
    });

    if (mode === "classic") {
      setFrameCount(3);
      currentTemplate = 0; // Classic Film
      if (el.filterSelect) {
        el.filterSelect.value = "sepia(35%) saturate(1.25) contrast(1.05)";
        if (el.video) el.video.style.filter = el.filterSelect.value;
      }
      gridMode = 0;
    } else if (mode === "y2k") {
      setFrameCount(4);
      currentTemplate = 10; // Snap Express
      if (el.filterSelect) {
        el.filterSelect.value = "brightness(1.3) contrast(1.2)";
        if (el.video) el.video.style.filter = el.filterSelect.value;
      }
      gridMode = 0;
    } else if (mode === "editorial") {
      setFrameCount(1);
      currentTemplate = 4; // Soft Archive
      if (el.filterSelect) {
        el.filterSelect.value = "grayscale(100%) contrast(1.25)";
        if (el.video) el.video.style.filter = el.filterSelect.value;
      }
      gridMode = 1; // 3x3 grid
    } else if (mode === "duo") {
      setFrameCount(2);
      currentTemplate = 1; // Sweet Memory
      gridMode = 2; // Duo silhouette guide
    } else if (mode === "custom") {
      // Free lab mode
    }

    if (el.viewfinderGrid)
      el.viewfinderGrid.classList.toggle("hidden", gridMode !== 1);
    if (el.viewfinderDuoGuide)
      el.viewfinderDuoGuide.classList.toggle("hidden", gridMode !== 2);
    if (el.btnGridToggle) {
      el.btnGridToggle.textContent =
        gridMode === 0 ? "⊞" : gridMode === 1 ? "▦" : "👥";
      el.btnGridToggle.classList.toggle("is-active", gridMode !== 0);
    }

    drawStrip();
    updateUI();
    beginSession();
  }

  async function copyPhotostripToClipboard() {
    if (isBusy || completedCount() !== maxFrames) return;
    try {
      const blob = await downloadCanvas();
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showToast("Photostrip berhasil disalin ke clipboard! Siap dipaste 📋");
      } else {
        throw new Error("ClipboardItem not supported");
      }
    } catch (error) {
      console.warn("Clipboard copy fallback:", error);
      try {
        const fallbackBlob = await downloadCanvas();
        triggerDownload(fallbackBlob);
        showToast("Browser tidak mengizinkan copy gambar. Mengunduh file...");
      } catch (e) {
        showToast("Gagal menyalin photostrip.", 2500);
      }
    }
  }

  function reEditStrip() {
    showScreen("capture");
    if (el.personalizeContent) {
      el.personalizeContent.classList.remove("hidden");
    }
    if (el.btnTogglePersonalize) {
      el.btnTogglePersonalize.setAttribute("aria-expanded", "true");
    }
    drawStrip();
    updateUI();
    showToast("Kembali ke studio editing — fotomu tetap aman!");
  }

  // Booth selection cards
  el.boothCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectBoothMode(card.dataset.booth);
    });
  });

  // Viewfinder tools
  el.btnSoundToggle?.addEventListener("click", toggleSound);
  el.btnGridToggle?.addEventListener("click", cycleGridMode);
  el.btnMirrorToggle?.addEventListener("click", toggleMirror);
  el.btnNextPose?.addEventListener("click", () => updatePoseGuide());

  // Personalization Lab controls
  el.btnTogglePersonalize?.addEventListener("click", () => {
    if (!el.personalizeContent) return;
    const isHidden = el.personalizeContent.classList.toggle("hidden");
    el.btnTogglePersonalize.setAttribute("aria-expanded", String(!isHidden));
  });

  el.customCaptionInput?.addEventListener("input", (e) => {
    userCaption = e.target.value.trim();
    drawStrip();
  });

  el.customDateInput?.addEventListener("input", (e) => {
    userDate = e.target.value.trim();
    drawStrip();
  });

  el.grainCheckbox?.addEventListener("change", (e) => {
    isGrainEnabled = Boolean(e.target.checked);
    drawStrip();
    showToast(
      isGrainEnabled
        ? "Analog film grain diaktifkan"
        : "Analog film grain dimatikan",
    );
  });

  el.stickerChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      el.stickerChips.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      selectedSticker =
        chip.dataset.sticker === "default" ? null : chip.dataset.sticker;
      drawStrip();
    });
  });

  // Done screen actions
  el.btnCopyImage?.addEventListener("click", copyPhotostripToClipboard);
  el.btnEditStrip?.addEventListener("click", reEditStrip);

  // Keyboard Navigation: Spacebar to capture, ArrowLeft/Right to switch templates
  window.addEventListener("keydown", (e) => {
    if (
      e.target &&
      (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
    )
      return;
    if (e.code === "Space") {
      if (
        !screens.capture?.classList.contains("hidden") &&
        el.capture &&
        !el.capture.disabled
      ) {
        e.preventDefault();
        takePhoto();
      }
    } else if (e.code === "ArrowLeft") {
      if (!screens.capture?.classList.contains("hidden")) {
        e.preventDefault();
        chooseTemplate(currentTemplate - 1);
      }
    } else if (e.code === "ArrowRight") {
      if (!screens.capture?.classList.contains("hidden")) {
        e.preventDefault();
        chooseTemplate(currentTemplate + 1);
      }
    }
  });

  // Brand home link
  el.brandHome?.addEventListener("click", (event) => {
    event.preventDefault();
    if (screens.capture && !screens.capture.classList.contains("hidden")) {
      resetSession();
    } else {
      showScreen("home");
    }
  });

  window.addEventListener("pagehide", stopCamera);

  /* ==========================================================================
     15. INITIALIZATION
     ========================================================================== */
  if (el.btnSoundToggle) {
    el.btnSoundToggle.textContent = isSoundEnabled ? "🔊" : "🔇";
    el.btnSoundToggle.classList.toggle("is-active", !isSoundEnabled);
  }
  if (el.btnMirrorToggle) {
    el.btnMirrorToggle.classList.toggle("is-active", isMirrored);
  }
  updatePoseGuide(0);
  updateProgressSlotsDOM();
  loadTemplateAssets();
  drawStrip();
  updateUI();
  showScreen("home");
})();
