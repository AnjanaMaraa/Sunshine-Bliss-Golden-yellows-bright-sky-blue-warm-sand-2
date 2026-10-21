/* ==========================================================================
   entrance.js — cinematic invitation cover (Feature A)
   - Locks page scrolling while the cover is active
   - Opens on click / tap / Enter / Space (button semantics)
   - Fires once; repeated triggers are ignored
   - Honours prefers-reduced-motion (quick fade instead of choreography)
   ========================================================================== */
(function () {
  "use strict";

  var entrance = document.getElementById("entrance");
  var trigger = document.getElementById("entranceTrigger");
  if (!entrance || !trigger) return;

  var data = window.invitationData || {};
  var cfg = data.entrance || {};
  var couple = data.couple || {};
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Populate cover text from configuration --- */
  var namesEl = document.getElementById("entranceNames");
  var ctaEl = document.getElementById("entranceCta");
  if (namesEl) {
    namesEl.textContent = (couple.groom || "") + " & " + (couple.bride || "");
  }
  if (ctaEl && cfg.title) {
    ctaEl.textContent = cfg.title;
  }
  trigger.setAttribute(
    "aria-label",
    "Tap to open the wedding invitation of " +
      (couple.groom || "the couple") + " and " + (couple.bride || "")
  );

  /* --- Entrance disabled in config: remove quietly --- */
  if (cfg.enabled === false) {
    entrance.setAttribute("hidden", "");
    return;
  }

  /* --- Activate the cover and lock scrolling --- */
  var root = document.documentElement;
  entrance.removeAttribute("hidden");
  entrance.dataset.state = "idle";
  root.classList.add("is-locked");

  var opened = false;
  var finishTimer = null;
  var OPEN_DURATION = reducedMotion ? 320 : 1650; // ms choreography length

  function finish() {
    entrance.dataset.state = "opened";
    entrance.classList.remove("is-active");
    entrance.setAttribute("hidden", "");
    root.classList.remove("is-locked");

    entrance.removeEventListener("click", open, true);
    if (finishTimer) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }

    /* Move focus into the invitation for keyboard users */
    var hero = document.getElementById("hero");
    if (hero) {
      hero.setAttribute("tabindex", "-1");
      hero.focus({ preventScroll: true });
      hero.addEventListener(
        "blur",
        function () {
          hero.removeAttribute("tabindex");
        },
        { once: true }
      );
    }

    /* Notify other modules (music, analytics, …) */
    document.dispatchEvent(new CustomEvent("invitation:opened"));
  }

  function open() {
    if (opened) return; // prevent repeated animation triggers
    opened = true;

    if (reducedMotion) {
      entrance.style.transition = "opacity 0.3s ease";
      entrance.style.opacity = "0";
      finishTimer = setTimeout(finish, 300);
      return;
    }

    /* Light flash as the curtains part */
    var flash = document.createElement("div");
    flash.className = "entrance__flash";
    flash.setAttribute("aria-hidden", "true");
    entrance.appendChild(flash);

    entrance.dataset.state = "opening";
    finishTimer = setTimeout(finish, OPEN_DURATION);
  }

  /* Click / tap anywhere on the cover; Enter / Space via the inner button */
  entrance.addEventListener("click", open, true);
})();
