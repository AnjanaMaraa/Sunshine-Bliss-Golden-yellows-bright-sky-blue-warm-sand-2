/* ==========================================================================
   Vikram & Ananya — Wedding Invitation Configuration
   --------------------------------------------------------------------------
   EVERY editable detail of this invitation lives in this file.
   Edit the values below — no other script needs to change.

   Rules applied by the site:
   - Empty / null optional sections (venue, dressCode, preWeddingEvents,
     transportation, accommodation) are HIDDEN automatically.
   - An empty wedding "time" hides every time display on the site.
   - The weekday is always calculated from the date — never hardcode it.
   ========================================================================== */

const invitationData = {
  couple: {
    groom: "Vikram",
    bride: "Ananya"
  },

  wedding: {
    // ISO format: YYYY-MM-DD
    date: "2024-08-16",
    // Optional. Leave "" until confirmed — the time is hidden while empty.
    time: "",
    // Optional IANA timezone (e.g. "Asia/Kolkata"). "" = visitor's local time.
    timezone: ""
  },

  theme: {
    colors: {
      turquoiseSurf: "#06aed5",
      cerulean: "#086788",
      brightAmber: "#f0c808",
      papayaWhip: "#fff1d0",
      primaryScarlet: "#dd1c1a"
    }
  },

  hero: {
    // REPLACE HERO IMAGE HERE — swap this file in assets/images/
    // (free-licensed placeholder downloaded from Unsplash; replace with the
    // couple's own photograph for production use)
    image: "assets/images/hero-placeholder.jpg",
    imageAlt: "Elegant wedding celebration setting with flowers and candles"
  },

  entrance: {
    enabled: true,
    title: "Tap to Open"
  },

  scratchReveal: {
    enabled: true,
    // Fraction of the card that must be scratched to auto-reveal (0.45–0.60)
    threshold: 0.5
  },

  /* -------------------------------------------------------------------------
     Program timeline — "Our Wedding Celebration"
     Times/dates are intentionally empty: display only what is configured.
     Add "date" / "time" / "description" entries when the family confirms them.
     ------------------------------------------------------------------------- */
  events: [
    {
      title: "Guest Arrival",
      date: "",
      time: "",
      description: "",
      icon: "welcome"
    },
    {
      title: "Wedding Ceremony",
      date: "",
      time: "",
      description: "",
      icon: "rings"
    },
    {
      title: "Reception",
      date: "",
      time: "",
      description: "",
      icon: "celebration"
    }
  ],

  /* -------------------------------------------------------------------------
     Venue — set to an object to display the section, e.g.
     venue: { name: "...", address: "...", mapUrl: "https://maps.google.com/...",
     image: "", note: "" }
     ------------------------------------------------------------------------- */
  venue: null,

  /* e.g. dressCode: [{ label: "Women", detail: "..." }, ...] */
  dressCode: [],

  /* e.g. preWeddingEvents: [{ name: "Mehendi", date: "", time: "", venue: "",
     description: "", image: "" }] */
  preWeddingEvents: [],

  /* e.g. transportation: { shuttle: "...", pickupPoint: "...", pickupTime: "",
     parking: "...", travel: "..." } */
  transportation: null,

  /* e.g. accommodation: { hotel: "...", address: "...", distance: "",
     booking: "...", bookingUrl: "", code: "" } */
  accommodation: null,

  gifts: {
    enabled: true,
    message:
      "Your love, blessings, and presence are the greatest gifts we could ever ask for."
  },

  rsvp: {
    enabled: true
  },

  music: {
    // Optional. Place a local file in assets/audio/ and set source + enabled.
    enabled: false,
    source: "assets/audio/instrumental.mp3"
  },

  footer: {
    couple: "", // auto: "Vikram & Ananya" when empty
    thankYou: "Thank you for being part of our story.",
    credit: "Website developed by Digimaraa Technologies",
    creditUrl: "https://digimaraa.com"
  }
};

/* Expose to window so deferred modules can read the configuration */
window.invitationData = invitationData;

/* --------------------------------------------------------------------------
   Shared helpers — single source of truth for date handling.
   The weekday is always derived from the configured date, never hardcoded.
   -------------------------------------------------------------------------- */
window.InviteUtils = (function () {
  "use strict";

  function parseISODate(iso) {
    if (!iso || typeof iso !== "string") return null;
    var m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) {
      var fallback = new Date(iso);
      return isNaN(fallback.getTime()) ? null : fallback;
    }
    // Build in local time so the displayed weekday matches the calendar date
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function weddingDate() {
    return parseISODate(window.invitationData && invitationData.wedding
      ? invitationData.wedding.date : "");
  }

  function displayDate(d) {
    if (!d) return "";
    var months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function weekday(d) {
    if (!d) return "";
    return d.toLocaleDateString(undefined, { weekday: "long" });
  }

  return {
    parseISODate: parseISODate,
    weddingDate: weddingDate,
    displayDate: displayDate,
    weekday: weekday
  };
})();
