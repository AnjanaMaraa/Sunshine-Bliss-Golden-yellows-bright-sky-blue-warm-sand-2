/* ==========================================================================
   countdown.js — "Counting Down to Forever"
   - Counts down to the configured wedding date (and time when supplied)
   - Past dates never show negative values: an elegant message is shown
   - Optional IANA timezone support; falls back to visitor local time
   - Interval is stopped once the countdown completes
   ========================================================================== */
(function () {
  "use strict";

  var grid = document.getElementById("countdownGrid");
  var past = document.getElementById("countdownPast");
  if (!grid || !past) return;

  var utils = window.InviteUtils;
  var data = window.invitationData || {};
  var wedding = data.wedding || {};

  var els = {
    days: document.getElementById("cdDays"),
    hours: document.getElementById("cdHours"),
    minutes: document.getElementById("cdMinutes"),
    seconds: document.getElementById("cdSeconds")
  };

  var pastDateEl = document.getElementById("countdownPastDate");
  var timerId = null;

  /* --- Build the target instant --- */
  function targetDate() {
    var d = utils ? utils.weddingDate() : null;
    if (!d) return null;

    var t = new Date(d.getTime()); // local midnight of the wedding day
    var timeMatch = typeof wedding.time === "string"
      ? wedding.time.trim().match(/^(\d{1,2}):(\d{2})/)
      : null;
    if (timeMatch) {
      t.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
    }

    /* Optional timezone: shift local target so it represents wall-clock
       time in the configured zone (best-effort, library-free). */
    if (wedding.timezone) {
      try {
        var zoneOffset = zoneOffsetMinutes(wedding.timezone, t);
        var localOffset = t.getTimezoneOffset();
        t = new Date(t.getTime() + (localOffset - zoneOffset) * 60000);
      } catch (err) {
        /* Invalid zone — keep visitor-local interpretation */
      }
    }
    return t;
  }

  /* Offset (minutes east of UTC) of an IANA zone at a given instant */
  function zoneOffsetMinutes(zone, date) {
    var dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    var parts = dtf.formatToParts(date);
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var asUTC = Date.UTC(
      Number(map.year), Number(map.month) - 1, Number(map.day),
      Number(map.hour) % 24, Number(map.minute), Number(map.second)
    );
    return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000;
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function setUnit(el, value) {
    if (!el) return;
    var next = value < 0 ? "0" : String(value);
    if (el.textContent !== next) {
      el.textContent = next;
      el.classList.remove("is-ticking");
      /* restart animation */
      void el.offsetWidth;
      el.classList.add("is-ticking");
    }
  }

  function showPastMessage() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    grid.setAttribute("hidden", "");
    if (pastDateEl) {
      var d = utils ? utils.weddingDate() : null;
      pastDateEl.textContent = d
        ? "Our special day \u2014 " + utils.displayDate(d) +
          (utils.weekday(d) ? " \u00b7 " + utils.weekday(d) : "")
        : "Our special day";
    }
    past.removeAttribute("hidden");
  }

  function tick() {
    var target = targetDate();
    if (!target) {
      showPastMessage();
      return;
    }
    var diff = target.getTime() - Date.now();

    if (diff <= 0) {
      showPastMessage();
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    setUnit(els.days, days);
    setUnit(els.hours, hours);
    setUnit(els.minutes, minutes);
    setUnit(els.seconds, seconds);
  }

  function start() {
    var target = targetDate();
    if (!target || target.getTime() <= Date.now()) {
      showPastMessage();
      return;
    }
    past.setAttribute("hidden", "");
    grid.removeAttribute("hidden");
    tick();
    timerId = setInterval(tick, 1000);
  }

  /* Re-sync instantly when the tab returns to view */
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && timerId) tick();
  });

  start();
})();
