/* ==========================================================================
   scratch.js — interactive scratch-to-reveal card (Feature B)
   - Pointer Events (mouse + touch + pen), touch scrolling suppressed
   - Gold-foil cover painted on canvas; erased with destination-out
   - Auto-reveals once the configured threshold of pixels is cleared
   - Keyboard-accessible "Reveal Invitation" fallback button
   ========================================================================== */
(function () {
  "use strict";

  var section = document.getElementById("save-the-date");
  var scratch = document.getElementById("scratch");
  var canvas = document.getElementById("scratchCanvas");
  var revealBtn = document.getElementById("scratchRevealBtn");
  var statusEl = document.getElementById("scratchStatus");
  if (!section || !scratch || !canvas || !revealBtn) return;

  var data = window.invitationData || {};
  var cfg = data.scratchReveal || {};
  var couple = data.couple || {};
  var utils = window.InviteUtils;

  /* --- Fill the concealed content from configuration --- */
  var wedding = data.wedding || {};
  var dateObj = utils ? utils.weddingDate() : null;

  var namesEl = document.getElementById("scratchNames");
  var dateEl = document.getElementById("scratchDate");
  var weekEl = document.getElementById("scratchWeekday");
  var timeEl = document.getElementById("scratchTime");

  if (namesEl) {
    namesEl.textContent = (couple.groom || "") + " & " + (couple.bride || "");
  }
  if (dateEl && dateObj) {
    dateEl.textContent = utils.displayDate(dateObj);
    dateEl.setAttribute("datetime", wedding.date || "");
  }
  if (weekEl && dateObj) {
    weekEl.textContent = utils.weekday(dateObj);
  }
  /* Time stays hidden unless supplied — never invent one */
  if (timeEl) {
    if (wedding.time) {
      timeEl.textContent = wedding.time;
      timeEl.removeAttribute("hidden");
    } else {
      timeEl.setAttribute("hidden", "");
    }
  }

  if (cfg.enabled === false) {
    section.setAttribute("hidden", "");
    return;
  }

  /* ------------------------------------------------------------------ */
  var ctx = canvas.getContext("2d", { willReadFrequently: true });

  /* Normalized heart silhouette (0..1 space) — must match #heart-clip */
  var HEART_PATH_D =
    "M0.5,0.95 C0.2,0.7 0,0.5 0,0.3 C0,0.12 0.15,0.02 0.3,0.02 " +
    "C0.4,0.02 0.47,0.08 0.5,0.15 C0.53,0.08 0.6,0.02 0.7,0.02 " +
    "C0.85,0.02 1,0.12 1,0.3 C1,0.5 0.8,0.7 0.5,0.95 Z";
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cssW = 0;
  var cssH = 0;
  var maskData = null; /* cached heart silhouette for progress sampling */
  var scratching = false;
  var revealed = false;
  var lastPoint = null;
  var strokeCount = 0;
  var lastCheck = 0;
  var revealTimer = null;
  var resizeTimer = null;
  var threshold = typeof cfg.threshold === "number"
    ? Math.min(Math.max(cfg.threshold, 0.35), 0.75)
    : 0.5;

  /* --- Paint the luxurious foil cover --- */
  function paintCover() {
    var w = cssW;
    var h = cssH;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    /* base foil gradient (papaya → amber, gold-like) */
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#f9dd8f");
    grad.addColorStop(0.28, "#f0c808");
    grad.addColorStop(0.52, "#fbe39a");
    grad.addColorStop(0.76, "#e8ba06");
    grad.addColorStop(1, "#f6d778");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    /* fine diagonal engraving */
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1;
    for (var i = -h; i < w + h; i += 9) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
    }
    ctx.restore();

    /* soft shimmer arcs */
    ctx.save();
    ctx.globalAlpha = 0.35;
    var sheen = ctx.createRadialGradient(w * 0.3, h * 0.25, 10, w * 0.3, h * 0.25, w * 0.7);
    sheen.addColorStop(0, "rgba(255,255,255,0.9)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    /* inner border — two heart outlines following the clipped shape */
    if (typeof Path2D !== "undefined") {
      strokeHeartOutline(ctx, w, h, 0.94, "rgba(8, 103, 136, 0.55)", 2);
      strokeHeartOutline(ctx, w, h, 0.86, "rgba(255, 255, 255, 0.55)", 1);
    }

    /* centre label — placed in the heart's wide upper zone */
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "rgba(8, 103, 136, 0.92)";
    ctx.font = "500 " + Math.round(Math.min(w * 0.075, 22)) +
      "px 'DM Sans', sans-serif";
    ctx.fillText("SCRATCH  HERE", w / 2, h * 0.34);

    ctx.fillStyle = "rgba(221, 28, 26, 0.85)";
    ctx.font = Math.round(Math.min(w * 0.06, 18)) + "px serif";
    ctx.fillText("\u2665", w / 2, h * 0.34 + 24);

    ctx.fillStyle = "rgba(8, 103, 136, 0.6)";
    ctx.font = "400 " + Math.round(Math.min(w * 0.045, 13)) +
      "px 'DM Sans', sans-serif";
    ctx.fillText("gently with your finger", w / 2, h * 0.54);
    ctx.restore();
  }

  /* Stroke the normalized heart path (0..1 space) scaled uniformly and
     centred, so the foil outline matches the clip-path silhouette */
  function strokeHeartOutline(context, w, h, inset, color, widthPx) {
    var s = Math.min(w, h) * inset;
    context.save();
    context.translate((w - s) / 2, (h - s) / 2);
    context.scale(s, s);
    context.strokeStyle = color;
    context.lineWidth = widthPx / s;
    context.stroke(new Path2D(HEART_PATH_D));
    context.restore();
  }

  function sizeCanvas() {
    var rect = scratch.querySelector(".scratch__card").getBoundingClientRect();
    if (!rect.width) return;
    cssW = Math.round(rect.width);
    cssH = Math.round(rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    paintCover();
    buildHeartMask();
  }

  /* Rasterize the heart once so scratch progress only counts the visible
     heart area (the clipped corners must not raise the effective threshold) */
  function buildHeartMask() {
    maskData = null;
    if (typeof Path2D === "undefined") return;
    try {
      var mc = document.createElement("canvas");
      mc.width = canvas.width;
      mc.height = canvas.height;
      var mctx = mc.getContext("2d");
      var s = Math.min(mc.width, mc.height) * 0.94;
      mctx.translate((mc.width - s) / 2, (mc.height - s) / 2);
      mctx.scale(s, s);
      mctx.fillStyle = "#000";
      mctx.fill(new Path2D(HEART_PATH_D));
      maskData = mctx.getImageData(0, 0, mc.width, mc.height).data;
    } catch (err) {
      maskData = null; /* fall back to full-rectangle sampling */
    }
  }

  /* --- Erasing --- */
  function toLocal(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function eraseTo(pt) {
    var brush = Math.max(20, cssW * 0.07);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pt.x, pt.y);
    } else {
      ctx.moveTo(pt.x + 0.01, pt.y);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    lastPoint = pt;
  }

  /* Sample alpha channel on a coarse grid (cheap & accurate enough).
     When the heart mask is available, only heart-interior pixels count. */
  function scratchedRatio() {
    var w = canvas.width;
    var h = canvas.height;
    var img;
    try {
      img = ctx.getImageData(0, 0, w, h).data;
    } catch (err) {
      return 0;
    }
    var step = 5; // sample every 5th pixel in x/y → 1/25 of pixels
    var total = 0;
    var clear = 0;
    for (var y = 0; y < h; y += step) {
      var rowOffset = y * w;
      for (var x = 0; x < w; x += step) {
        var idx = rowOffset + x;
        if (maskData && maskData[idx * 4 + 3] < 40) continue; // outside heart
        total++;
        if (img[idx * 4 + 3] < 40) clear++;
      }
    }
    return total ? clear / total : 0;
  }

  function announceReveal() {
    if (statusEl) {
      var names = (couple.groom || "") + " & " + (couple.bride || "");
      statusEl.textContent =
        names + " \u2014 " + (dateEl ? dateEl.textContent : "") +
        (weekEl && weekEl.textContent ? " \u00b7 " + weekEl.textContent : "") +
        ". The invitation has been revealed.";
    }
  }

  function finishReveal() {
    if (revealed) return;
    revealed = true;
    scratching = false;
    canvas.classList.add("is-revealed");
    revealBtn.setAttribute("hidden", "");
    announceReveal();
    /* Drop the canvas from the layout after the fade completes */
    revealTimer = setTimeout(function () {
      canvas.style.display = "none";
    }, 800);
  }

  function checkProgress(force) {
    if (revealed) return;
    var now = Date.now();
    if (!force && now - lastCheck < 160) return;
    lastCheck = now;
    if (scratchedRatio() >= threshold) {
      finishReveal();
    }
  }

  /* --- Pointer handling --- */
  function onPointerDown(e) {
    if (revealed) return;
    scratching = true;
    lastPoint = null;
    canvas.classList.add("is-scratching");
    if (canvas.setPointerCapture) {
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    }
    eraseTo(toLocal(e));
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!scratching || revealed) return;
    eraseTo(toLocal(e));
    strokeCount++;
    if (strokeCount % 6 === 0) checkProgress(false);
    e.preventDefault(); /* suppress page scroll while scratching */
  }

  function onPointerUp(e) {
    if (!scratching) return;
    scratching = false;
    lastPoint = null;
    canvas.classList.remove("is-scratching");
    checkProgress(true);
    if (e) e.preventDefault();
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);

  /* Keyboard / assistive fallback */
  revealBtn.addEventListener("click", function () {
    finishReveal();
  });

  /* Responsive: repaint cover on resize (unless already revealed) */
  window.addEventListener("resize", function () {
    if (revealed) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var rect = scratch.querySelector(".scratch__card").getBoundingClientRect();
      if (!rect.width) return;
      if (Math.abs(Math.round(rect.width) - cssW) > 40 ||
          Math.abs(Math.round(rect.height) - cssH) > 40) {
        sizeCanvas();
      }
    }, 200);
  });

  /* Initialise once layout is ready and fonts can settle */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(sizeCanvas);
  }
  sizeCanvas();
  window.addEventListener("load", sizeCanvas);
})();
