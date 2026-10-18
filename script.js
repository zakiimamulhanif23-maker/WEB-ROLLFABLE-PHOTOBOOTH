"use strict";

(() => {
  const screens = {
    home: document.getElementById("screen-home"),
    capture: document.getElementById("screen-capture"),
    downloading: document.getElementById("screen-downloading"),
    done: document.getElementById("screen-done"),
  };

  const el = {
    start: document.getElementById("btnStart"),
    navStudio: document.getElementById("btnNavStudio"),
    navPrint: document.getElementById("navPrint"),
    capture: document.getElementById("btnCapture"),
    captureText: document.getElementById("captureButtonText"),
    download: document.getElementById("btnDownload"),
    retake: document.getElementById("btnRetake"),
    prevTemplate: document.getElementById("btnPrevTpl"),
    nextTemplate: document.getElementById("btnNextTpl"),
    templateButtons: [...document.querySelectorAll("[data-template]")],
    home: document.getElementById("btnHome"),
    switchCamera: document.getElementById("btnSwitchCamera"),
    video: document.getElementById("video"),
    filterSelect: document.getElementById("filter-select"),
    cameraStage: document.getElementById("cameraStage"),
    cameraPlaceholder: document.getElementById("cameraPlaceholder"),
    cameraStatus: document.getElementById("cameraStatus"),
    cameraMeta: document.getElementById("cameraMeta"),
    cameraClickSound: document.getElementById("cameraClickSound"),
    countdown: document.getElementById("countdown"),
    flash: document.getElementById("cameraFlash"),
    homeError: document.getElementById("homeError"),
    stripPreview: document.getElementById("stripPreview"),
    stripOut: document.getElementById("stripOut"),
    stripFinal: document.getElementById("stripFinal"),
    templateName: document.getElementById("templateName"),
    templateCounter: document.getElementById("templateCounter"),
    shotCounter: document.getElementById("shotCounter"),
    progressCount: document.getElementById("progressCount"),
    progressSlots: [1, 2, 3].map((n) =>
      document.getElementById(`progress${n}`),
    ),
    canvas: document.getElementById("canvas"),
  };

  const ctx = el.canvas.getContext("2d", { alpha: false });
  const STRIP_W = 360;
  const STRIP_H = 1080;
  const SLOT = { x: 30, w: 300, h: 225, y: [200, 445, 690] };
  const COUNTDOWN_SECONDS = 3;
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
      name: "11 — THE SNAP EXPRESS",
      title: "THE SNAP EXPRESS",
      subtitle: "GOOD THINGS ARE COMING",
      footer: "ROW 45 · SEAT A33",
      paper: "#fbf8e8",
      ink: "#6f1728",
      muted: "#9a4a54",
      blank: "#08070c",
      accent: "#6f1728",
      hole: "#d9ccb6",
      sticker: "✦",
      asset: "template photbooth #1.jpeg",
      crop: { x: 160, y: 109, width: 355, height: 1065 },
      photoSlots: [
        { x: 188, y: 284, width: 307, height: 246 },
        { x: 188, y: 541, width: 307, height: 247 },
        { x: 188, y: 799, width: 307, height: 247 },
      ],
    },
    {
      name: "12 — MUSIC CLASSICAL",
      title: "MUSIC CLASSICAL",
      subtitle: "A SOUNDTRACK OF TODAY",
      footer: "08 / 06 / 2026",
      paper: "#4b0005",
      ink: "#f4eadf",
      muted: "#ddc6b1",
      blank: "#fff",
      accent: "#e9d9cb",
      hole: "#d8c6b4",
      sticker: "♫",
      asset: "template photbooth #2.jpeg",
      crop: { x: 188, y: 86, width: 369, height: 1114 },
      photoSlots: [
        { x: 243, y: 326, width: 267, height: 201 },
        { x: 243, y: 566, width: 267, height: 201 },
        { x: 240, y: 807, width: 267, height: 202 },
      ],
      transparentPhotoOpenings: true,
    },
    {
      name: "13 — FAVORITE PERSON",
      title: "FAVORITE PERSON",
      subtitle: "FRIENDS ARE THE FAMILY WE CHOOSE",
      footer: "WITH LOVE, ALWAYS",
      paper: "#a52731",
      ink: "#f6e8d5",
      muted: "#e7c9b8",
      blank: "#fff",
      accent: "#f4dec4",
      hole: "#efd8c8",
      sticker: "♡",
      asset: "template photbooth #3.jpeg",
      crop: { x: 148, y: 0, width: 440, height: 1308 },
      photoSlots: [
        { x: 190, y: 66, width: 354, height: 354 },
        { x: 190, y: 470, width: 354, height: 416 },
        { x: 190, y: 906, width: 354, height: 384 },
      ],
      transparentPhotoOpenings: true,
    },
  ];

  const templateAssets = new Map();
  let stream = null;
  let facingMode = "user";
  let currentTemplate = 0;
  let photos = [null, null, null];
  let isBusy = false;
  let sessionActive = false;

  const pause = (ms) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));
  const completedCount = () => photos.filter(Boolean).length;

  function showScreen(name) {
    Object.entries(screens).forEach(([key, node]) => {
      node.classList.toggle("hidden", key !== name);
      node.setAttribute("aria-hidden", key !== name ? "true" : "false");
    });
    el.navStudio.classList.toggle("hidden", name !== "home");
    el.navPrint.classList.toggle("hidden", name !== "home");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function setStatus(message, kind = "normal") {
    el.cameraStatus.textContent = message;
    el.cameraStatus.dataset.kind = kind;
  }

  function showHomeError(message) {
    el.homeError.textContent = message;
    el.homeError.classList.remove("hidden");
  }

  function hideHomeError() {
    el.homeError.textContent = "";
    el.homeError.classList.add("hidden");
  }

  function updateUI() {
    const count = completedCount();
    const isFull = count === 3;

    el.shotCounter.textContent = `FRAME ${String(Math.min(count + 1, 3)).padStart(2, "0")} / 03`;
    el.captureText.textContent = isFull
      ? "ALL FRAMES CAPTURED"
      : `TAKE PHOTO ${String(count + 1).padStart(2, "0")} / 03`;
    el.progressCount.textContent = `${count} OF 3`;
    el.progressSlots.forEach((slot, index) => {
      slot.classList.toggle("is-filled", Boolean(photos[index]));
      slot.setAttribute(
        "aria-label",
        `Frame ${index + 1}${photos[index] ? ", sudah terisi" : ", kosong"}`,
      );
    });

    el.capture.disabled = isBusy || isFull || !stream;
    el.navStudio.disabled = isBusy;
    el.filterSelect.disabled = isBusy;
    el.download.disabled = isBusy || !isFull;
    el.retake.disabled = isBusy || count === 0;
    el.prevTemplate.disabled = isBusy;
    el.nextTemplate.disabled = isBusy;
    el.switchCamera.disabled = isBusy || !stream;

    el.templateButtons.forEach((button, index) => {
      const active = index === currentTemplate;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

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
    el.video.srcObject = stream;
    el.video.style.transform =
      facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";

    try {
      await el.video.play();
    } catch (error) {
      stopCamera();
      throw new Error(
        "Kamera terdeteksi, tetapi preview gagal dimulai. Muat ulang halaman dan izinkan kamera.",
      );
    }

    if (!el.video.videoWidth) {
      await new Promise((resolve, reject) => {
        const timeout = window.setTimeout(
          () =>
            reject(
              new Error(
                "Preview kamera tidak merespons. Coba ganti kamera atau muat ulang halaman.",
              ),
            ),
          8000,
        );
        el.video.addEventListener(
          "loadedmetadata",
          () => {
            clearTimeout(timeout);
            resolve();
          },
          { once: true },
        );
      });
    }

    sessionActive = true;
    el.cameraPlaceholder.classList.add("hidden");
    el.cameraMeta.textContent =
      facingMode === "user" ? "CAM 01 · FRONT" : "CAM 02 · REAR";
    setStatus("Kamera aktif. Atur pose, lalu tekan TAKE PHOTO.", "success");
    updateUI();
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
    facingMode = facingMode === "user" ? "environment" : "user";
    el.switchCamera.disabled = true;
    setStatus("Mengganti kamera…");
    try {
      await startCamera();
    } catch (error) {
      facingMode = previousFacing;
      try {
        await startCamera();
      } catch (_) {
        /* leave the helpful error below */
      }
      setStatus(
        "Kamera belakang tidak tersedia. Kamera sebelumnya dipertahankan.",
        "error",
      );
    } finally {
      updateUI();
    }
  }

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

    ctx.fillStyle = theme.accent;
    ctx.font = "20px Georgia, serif";
    ctx.fillText(theme.sticker, STRIP_W / 2, 145);
    ctx.strokeStyle = theme.hole;
    ctx.beginPath();
    ctx.moveTo(70, 164);
    ctx.lineTo(290, 164);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = theme.ink;
    ctx.font = "bold 11px monospace";
    ctx.fillText(theme.footer, STRIP_W / 2, 986);
    ctx.fillStyle = theme.muted;
    ctx.font = "8px monospace";
    ctx.fillText("FLASHBACK PHOTO CLUB · 2026", STRIP_W / 2, 1010);
    ctx.fillStyle = theme.accent;
    ctx.font = "17px Georgia, serif";
    ctx.fillText(theme.sticker, STRIP_W / 2, 1040);
    if (theme.frameStyle) drawTemplateOrnaments(theme);
  }

  function drawTemplateOrnaments(theme) {
    ctx.save();
    ctx.fillStyle = theme.accent;
    ctx.strokeStyle = theme.hole;
    ctx.globalAlpha = 0.8;

    if (theme.ornament === "dots") {
      for (let x = 82; x <= 278; x += 14) {
        ctx.beginPath();
        ctx.arc(x, 164, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.arc(x, 958, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme.ornament === "lines") {
      [425, 670].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(55, y);
        ctx.lineTo(305, y);
        ctx.stroke();
        ctx.font = "13px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("⌂", STRIP_W / 2, y + 4);
      });
    } else if (theme.ornament === "stars" || theme.ornament === "midnight") {
      [425, 670].forEach((y) => {
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
      [425, 670].forEach((y) => {
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
      [425, 670].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(70, y);
        ctx.lineTo(290, y);
        ctx.stroke();
      });
    } else {
      [425, 670].forEach((y) => {
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
    ctx.fillText("✳", x + SLOT.w / 2, y + 92);
    ctx.font = "bold 10px monospace";
    ctx.fillText(
      `YOUR PHOTO ${String(index + 1).padStart(2, "0")}`,
      x + SLOT.w / 2,
      y + 127,
    );
    ctx.font = "8px monospace";
    ctx.fillText("A MOMENT GOES HERE", x + SLOT.w / 2, y + 145);
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
      ctx.fillText(theme.sticker, x + SLOT.w / 2, y + 94);
      ctx.font = "bold 10px monospace";
      ctx.fillText(
        `YOUR PHOTO ${String(index + 1).padStart(2, "0")}`,
        x + SLOT.w / 2,
        y + 129,
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
            pixels[offset] > 245 &&
            pixels[offset + 1] > 245 &&
            pixels[offset + 2] > 245
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
    theme.photoSlots.forEach((slot, index) => {
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
  }

  function drawStrip() {
    const theme = THEMES[currentTemplate];
    el.canvas.width = STRIP_W;
    el.canvas.height = STRIP_H;
    ctx.clearRect(0, 0, STRIP_W, STRIP_H);
    if (theme.asset) {
      drawAssetTemplate(theme, templateAssets.get(theme.asset));
      const dataUrl = el.canvas.toDataURL("image/png");
      el.stripPreview.src = dataUrl;
      el.stripOut.src = dataUrl;
      el.stripFinal.src = dataUrl;
      el.templateName.textContent = theme.name;
      el.templateCounter.textContent = `${String(currentTemplate + 1).padStart(2, "0")} / ${String(THEMES.length).padStart(2, "0")}`;
      return dataUrl;
    }
    drawBase(theme);

    photos.forEach((photo, index) => {
      const x = SLOT.x;
      const y = SLOT.y[index];
      if (theme.frameStyle) {
        drawStyledSlot(photo, index, theme, x, y);
        return;
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
    });

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
      ctx.moveTo(42, 958);
      ctx.lineTo(318, 958);
      ctx.stroke();
    }

    const dataUrl = el.canvas.toDataURL("image/png");
    el.stripPreview.src = dataUrl;
    el.stripOut.src = dataUrl;
    el.stripFinal.src = dataUrl;
    el.templateName.textContent = theme.name;
    el.templateCounter.textContent = `${String(currentTemplate + 1).padStart(2, "0")} / ${String(THEMES.length).padStart(2, "0")}`;
    return dataUrl;
  }

  async function runCountdown() {
    el.countdown.classList.remove("hidden");
    for (let remaining = COUNTDOWN_SECONDS; remaining > 0; remaining -= 1) {
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
    el.cameraClickSound.currentTime = 0;
    void el.cameraClickSound.play().catch((error) => {
      console.error("Camera click sound error:", error);
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
    if (!el.video.videoWidth || !el.video.videoHeight) {
      throw new Error(
        "Preview kamera belum siap. Tunggu sampai gambar kamera terlihat, lalu coba lagi.",
      );
    }
    const photo = document.createElement("canvas");
    photo.width = el.video.videoWidth;
    photo.height = el.video.videoHeight;
    const photoContext = photo.getContext("2d");
    const filter = el.filterSelect.value;
    const supportsCanvasFilter = "filter" in photoContext;
    photoContext.save();
    if (supportsCanvasFilter) photoContext.filter = filter;
    if (facingMode === "user") {
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
    if (isBusy || index >= 3 || !stream) return;

    isBusy = true;
    updateUI();
    setStatus(`Bersiap untuk frame ${index + 1}. Senyum dulu…`);

    try {
      await runCountdown();
      playCameraClickSound();
      photos[index] = captureFrame();
      el.flash.classList.remove("flash");
      void el.flash.offsetWidth;
      el.flash.classList.add("flash");
      drawStrip();
      setStatus(
        `Frame ${index + 1} tersimpan. ${index < 2 ? "Lanjutkan untuk mengambil foto berikutnya." : "Semua frame lengkap — photostrip siap disimpan."}`,
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

  function chooseTemplate(index) {
    if (isBusy) return;
    currentTemplate = (index + THEMES.length) % THEMES.length;
    drawStrip();
    updateUI();
  }

  function retakeLastPhoto() {
    if (isBusy) return;
    const count = completedCount();
    if (!count) return;
    photos[count - 1] = null;
    drawStrip();
    updateUI();
    setStatus(
      `Frame ${count} dihapus. Tekan TAKE PHOTO untuk mengambil ulang.`,
      "normal",
    );
  }

  function downloadCanvas() {
    return new Promise((resolve, reject) => {
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
    link.download = `flashback-photostrip-${stamp}.png`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  }

  async function printAndSave() {
    if (isBusy || completedCount() !== 3) return;
    isBusy = true;
    updateUI();
    drawStrip();
    showScreen("downloading");
    stopCamera();

    try {
      const blob = await downloadCanvas();
      el.stripOut.classList.remove("play");
      void el.stripOut.offsetWidth;
      el.stripOut.classList.add("play");
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

  async function beginSession() {
    if (isBusy) return;
    hideHomeError();
    el.start.disabled = true;
    el.navStudio.disabled = true;
    showScreen("capture");
    el.cameraPlaceholder.classList.remove("hidden");
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
      el.start.disabled = false;
      el.navStudio.disabled = false;
      updateUI();
    }
  }

  function resetSession() {
    stopCamera();
    photos = [null, null, null];
    isBusy = false;
    el.countdown.classList.add("hidden");
    el.cameraPlaceholder.classList.remove("hidden");
    setStatus("Tekan tombol mulai untuk mengaktifkan kamera.");
    el.cameraMeta.textContent = "CAM 01 · READY";
    drawStrip();
    updateUI();
    showScreen("home");
  }

  el.start.addEventListener("click", beginSession);
  el.navStudio.addEventListener("click", beginSession);
  el.filterSelect.addEventListener("change", () => {
    el.video.style.filter = el.filterSelect.value;
  });
  el.capture.addEventListener("click", takePhoto);
  el.download.addEventListener("click", printAndSave);
  el.retake.addEventListener("click", retakeLastPhoto);
  el.prevTemplate.addEventListener("click", () =>
    chooseTemplate(currentTemplate - 1),
  );
  el.nextTemplate.addEventListener("click", () =>
    chooseTemplate(currentTemplate + 1),
  );
  el.templateButtons.forEach((button) => {
    button.addEventListener("click", () =>
      chooseTemplate(Number(button.dataset.template)),
    );
  });
  el.home.addEventListener("click", resetSession);
  el.switchCamera.addEventListener("click", switchCamera);
  document.getElementById("brandHome").addEventListener("click", (event) => {
    event.preventDefault();
    if (!screens.capture.classList.contains("hidden")) resetSession();
    else showScreen("home");
  });
  window.addEventListener("pagehide", stopCamera);

  // Build an attractive template preview before asking the user for camera access.
  loadTemplateAssets();
  drawStrip();
  updateUI();
  showScreen("home");
})();
