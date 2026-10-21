/* ==========================================================================
   main.js — application glue
   - Injects every text detail from js/invitation-data.js (single source)
   - Scroll-reveal animations (IntersectionObserver, reduced-motion aware)
   - Optional sections (venue / dress code / pre-wedding / transport /
     accommodation) render only when configured, otherwise stay hidden
   - Floating controls: back-to-top, RSVP shortcut, optional music toggle
   - Subtle hero parallax & floating petals
   ========================================================================== */
(function () {
  "use strict";

  var data = window.invitationData || {};
  var couple = data.couple || {};
  var wedding = data.wedding || {};
  var utils = window.InviteUtils;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var groomName = couple.groom || "";
  var brideName = couple.bride || "";
  var coupleLine = groomName + " & " + brideName;
  var dateObj = utils ? utils.weddingDate() : null;
  var dateLine = dateObj && utils ? utils.displayDate(dateObj) : wedding.date || "";
  var weekdayLine = dateObj && utils ? utils.weekday(dateObj) : "";

  /* ------------------------------------------------------------------
     1. Text & media injection
     ------------------------------------------------------------------ */
  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  setText("heroGroom", groomName);
  setText("heroBride", brideName);
  setText("heroDate", dateLine);
  setText("heroWeekday", weekdayLine ? "\u00b7 " + weekdayLine : "");
  var heroDateEl = document.getElementById("heroDate");
  if (heroDateEl) heroDateEl.setAttribute("datetime", wedding.date || "");

  setText("introGroom", groomName);
  setText("introBride", brideName);
  setText("introDate", dateLine);
  setText("introWeekday", weekdayLine);
  var introDateEl = document.getElementById("introDate");
  if (introDateEl) introDateEl.setAttribute("datetime", wedding.date || "");

  var introTime = document.getElementById("introTime");
  if (introTime) {
    if (wedding.time) {
      introTime.textContent = "Time \u00b7 " + wedding.time;
      introTime.removeAttribute("hidden");
    } else {
      introTime.setAttribute("hidden", "");
    }
  }

  setText("footerNames", (data.footer && data.footer.couple) || coupleLine);
  setText("footerThanks", (data.footer && data.footer.thankYou) || "");
  var creditEl = document.getElementById("footerCredit");
  if (data.footer && creditEl) {
    creditEl.textContent = data.footer.credit || "";
    if (!data.footer.creditUrl && data.footer.credit) {
      creditEl.removeAttribute("href");
    } else if (data.footer.creditUrl) {
      creditEl.setAttribute("href", data.footer.creditUrl);
      creditEl.setAttribute("target", "_blank");
      creditEl.setAttribute("rel", "noopener noreferrer");
    }
  }

  /* Gifts */
  var giftsSection = document.getElementById("gifts");
  if (data.gifts && data.gifts.enabled === false) {
    if (giftsSection) giftsSection.setAttribute("hidden", "");
  } else if (data.gifts) {
    setText("giftsMessage", data.gifts.message || "");
  }

  /* Hero image from configuration */
  var heroImage = document.getElementById("heroImage");
  if (heroImage && data.hero) {
    if (data.hero.image) heroImage.setAttribute("src", data.hero.image);
    if (data.hero.imageAlt) heroImage.setAttribute("alt", data.hero.imageAlt);
  }

  /* ------------------------------------------------------------------
     2. Optional sections
     ------------------------------------------------------------------ */
  function card(title) {
    var wrap = document.createElement("div");
    wrap.className = "info-card";
    if (title) {
      var h = document.createElement("h3");
      h.className = "info-card__title";
      h.textContent = title;
      wrap.appendChild(h);
    }
    return wrap;
  }

  function line(parent, label, value) {
    if (!value) return;
    var p = document.createElement("p");
    p.className = "info-card__line";
    if (label) {
      var span = document.createElement("span");
      span.className = "info-card__label";
      span.textContent = label;
      p.appendChild(span);
    }
    p.appendChild(document.createTextNode(String(value)));
    parent.appendChild(p);
  }

  function safeUrl(url) {
    if (!url) return null;
    var u = String(url).trim();
    if (/^https?:\/\//i.test(u)) return u;
    return null;
  }

  /* Venue */
  var venueSection = document.getElementById("venue");
  var venueMount = document.getElementById("venueMount");
  if (venueSection && venueMount) {
    var venue = data.venue;
    var hasVenue = venue && (venue.name || venue.address || venue.mapUrl);
    if (hasVenue) {
      var vCard = card(venue.name);
      line(vCard, "Address", venue.address);
      line(vCard, "Note", venue.note);
      if (venue.image) {
        var vImg = document.createElement("img");
        vImg.className = "info-card__image";
        vImg.src = venue.image;
        vImg.alt = (venue.name || "Wedding venue") + " venue photo";
        vImg.loading = "lazy";
        vImg.decoding = "async";
        vCard.insertBefore(vImg, vCard.firstChild);
      }
      var mapUrl = safeUrl(venue.mapUrl);
      if (mapUrl) {
        var mapLink = document.createElement("a");
        mapLink.className = "btn btn--solid";
        mapLink.href = mapUrl;
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        mapLink.textContent = "View on Google Maps";
        mapLink.style.marginTop = "1rem";
        vCard.appendChild(mapLink);
      }
      venueMount.appendChild(vCard);
      venueSection.removeAttribute("hidden");
    }
  }

  /* Dress code */
  var dressSection = document.getElementById("dress-code");
  var dressMount = document.getElementById("dresscodeMount");
  if (dressSection && dressMount && Array.isArray(data.dressCode)) {
    var dressItems = data.dressCode.filter(function (d) {
      return d && (d.label || d.detail);
    });
    if (dressItems.length) {
      dressItems.forEach(function (d) {
        var dCard = card(d.label);
        line(dCard, null, d.detail);
        dressMount.appendChild(dCard);
      });
      dressSection.removeAttribute("hidden");
    }
  }

  /* Pre-wedding events */
  var preSection = document.getElementById("pre-wedding");
  var preMount = document.getElementById("preWeddingMount");
  if (preSection && preMount && Array.isArray(data.preWeddingEvents)) {
    var preItems = data.preWeddingEvents.filter(function (e) {
      return e && e.name;
    });
    if (preItems.length) {
      preItems.forEach(function (e) {
        var pCard = card(e.name);
        if (e.image) {
          var pImg = document.createElement("img");
          pImg.className = "info-card__image";
          pImg.src = e.image;
          pImg.alt = e.name + " celebration";
          pImg.loading = "lazy";
          pImg.decoding = "async";
          pCard.insertBefore(pImg, pCard.firstChild);
        }
        var meta = [e.date, e.time].filter(Boolean).join(" \u00b7 ");
        line(pCard, "When", meta);
        line(pCard, "Venue", e.venue);
        line(pCard, null, e.description);
        preMount.appendChild(pCard);
      });
      preSection.removeAttribute("hidden");
    }
  }

  /* Transportation */
  var transportSection = document.getElementById("getting-there");
  var transportMount = document.getElementById("transportMount");
  if (transportSection && transportMount && data.transportation) {
    var tr = data.transportation;
    if (tr.shuttle || tr.pickupPoint || tr.parking || tr.travel) {
      var tCard = card(null);
      line(tCard, "Shuttle Service", tr.shuttle);
      line(tCard, "Pickup Point", tr.pickupPoint);
      line(tCard, "Pickup Time", tr.pickupTime);
      line(tCard, "Parking", tr.parking);
      line(tCard, "Travel Tips", tr.travel);
      transportMount.appendChild(tCard);
      transportSection.removeAttribute("hidden");
    }
  }

  /* Accommodation */
  var staySection = document.getElementById("accommodation");
  var stayMount = document.getElementById("stayMount");
  if (staySection && stayMount && data.accommodation) {
    var ac = data.accommodation;
    if (ac.hotel || ac.address || ac.booking) {
      var aCard = card(ac.hotel);
      line(aCard, "Address", ac.address);
      line(aCard, "Distance from Venue", ac.distance);
      line(aCard, "Booking", ac.booking);
      line(aCard, "Reservation Code", ac.code);
      var bookUrl = safeUrl(ac.bookingUrl);
      if (bookUrl) {
        var bookLink = document.createElement("a");
        bookLink.className = "btn btn--solid";
        bookLink.href = bookUrl;
        bookLink.target = "_blank";
        bookLink.rel = "noopener noreferrer";
        bookLink.textContent = "Book Your Stay";
        bookLink.style.marginTop = "1rem";
        aCard.appendChild(bookLink);
      }
      stayMount.appendChild(aCard);
      staySection.removeAttribute("hidden");
    }
  }

  /* ------------------------------------------------------------------
     3. Scroll reveals
     ------------------------------------------------------------------ */
  var revealsInitialised = false;

  function initReveals() {
    if (revealsInitialised) return;
    revealsInitialised = true;

    var targets = document.querySelectorAll(".reveal");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }

    /* gentle stagger for siblings */
    var groups = {};
    targets.forEach(function (t) {
      var key = t.parentNode;
      groups[key] = groups[key] || [];
      var idx = groups[key].length;
      groups[key].push(t);
      if (idx > 0) {
        t.style.setProperty("--reveal-delay", (idx * 0.09).toFixed(2) + "s");
      }
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach(function (t) { observer.observe(t); });
  }

  var entranceCfg = data.entrance || {};
  if (document.getElementById("entrance") && entranceCfg.enabled !== false) {
    document.addEventListener("invitation:opened", initReveals, { once: true });
    /* Safety net in case the entrance module failed to load */
    setTimeout(initReveals, 5000);
  } else {
    initReveals();
  }

  /* ------------------------------------------------------------------
     4. Floating petals
     ------------------------------------------------------------------ */
  function spawnPetals(container, count) {
    if (!container || reducedMotion) return;
    var kinds = ["rose", "gold", "aqua", "cream"];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "petal petal--" + kinds[i % kinds.length];
      var size = 8 + Math.random() * 8;
      p.style.left = Math.random() * 100 + "%";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.animationDuration = 9 + Math.random() * 9 + "s";
      p.style.animationDelay = -Math.random() * 14 + "s";
      frag.appendChild(p);
    }
    container.appendChild(frag);
  }

  spawnPetals(document.getElementById("entrancePetals"), 12);
  spawnPetals(document.getElementById("heroPetals"), 10);

  /* ------------------------------------------------------------------
     5. Floating controls
     ------------------------------------------------------------------ */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    var onScroll = function () {
      if (window.scrollY > 520) {
        backToTop.removeAttribute("hidden");
      } else {
        backToTop.setAttribute("hidden", "");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* Optional music — never autoplays before the opening gesture */
  var musicBtn = document.getElementById("musicToggle");
  var musicCfg = data.music || {};
  var audio = null;

  if (musicBtn && musicCfg.enabled && musicCfg.source) {
    audio = new Audio(musicCfg.source);
    audio.loop = true;
    audio.volume = 0.55;
    audio.preload = "none";
    musicBtn.removeAttribute("hidden");

    var setPlayingUI = function (playing) {
      musicBtn.setAttribute("aria-pressed", playing ? "true" : "false");
      musicBtn.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
      musicBtn.querySelector(".float-btn__icon").textContent = playing ? "\u266A" : "\u266B";
    };

    musicBtn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(function () { setPlayingUI(true); })
          .catch(function () { setPlayingUI(false); });
      } else {
        audio.pause();
        setPlayingUI(false);
      }
    });

    /* The invitation-opening gesture may start music where permitted */
    document.addEventListener("invitation:opened", function () {
      audio.play().then(function () { setPlayingUI(true); })
        .catch(function () { /* browser blocked it — user can tap the button */ });
    });
  }

  /* ------------------------------------------------------------------
     6. Subtle hero parallax (desktop, motion allowed)
     ------------------------------------------------------------------ */
  var heroImageEl = document.getElementById("heroImage");
  if (heroImageEl && !reducedMotion) {
    var ticking = false;
    var applyParallax = function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroImageEl.style.transform = "translate3d(0," + (y * 0.16).toFixed(1) + "px,0) scale(1.06)";
      }
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(applyParallax);
      }
    }, { passive: true });
    heroImageEl.classList.add("is-parallax");
    applyParallax();
  }
})();
