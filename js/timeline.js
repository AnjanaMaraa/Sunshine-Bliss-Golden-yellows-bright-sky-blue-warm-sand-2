/* ==========================================================================
   timeline.js — "Our Wedding Celebration"
   Renders the program timeline from invitationData.events.
   Missing dates / times / descriptions are simply omitted — nothing is
   invented. The layout adapts automatically to the number of events.
   ========================================================================== */
(function () {
  "use strict";

  var list = document.getElementById("timeline");
  var section = document.getElementById("celebration");
  if (!list || !section) return;

  var data = window.invitationData || {};
  var events = Array.isArray(data.events) ? data.events : [];

  /* Small inline icon set (stroke: currentColor) */
  var ICONS = {
    welcome:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>' +
      '<circle cx="12" cy="12" r="4.5"/></svg>',
    rings:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'aria-hidden="true"><circle cx="8.5" cy="13" r="5"/><circle cx="15.5" cy="13" r="5"/>' +
      '<path d="M12 4.5l1.4 2.2h-2.8z" fill="currentColor" stroke="none"/></svg>',
    celebration:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M5 3l5 8-2.4 1.4L4.2 5.2z"/>' +
      '<path d="M19 3l-5 8 2.4 1.4L19.8 5.2z"/><path d="M10 12.5l2 8 2-8"/></svg>',
    sparkle:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>' +
      '<path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/></svg>'
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function metaText(evt) {
    var bits = [];
    if (evt.date) bits.push(String(evt.date));
    if (evt.time) bits.push(String(evt.time));
    return bits.join(" \u00b7 ");
  }

  var frag = document.createDocumentFragment();
  var count = 0;

  events.forEach(function (evt) {
    if (!evt || !evt.title) return;

    var item = el("li", "timeline__item reveal");

    var node = el("span", "timeline__node");
    node.setAttribute("aria-hidden", "true");
    node.innerHTML = ICONS[evt.icon] || ICONS.sparkle;
    item.appendChild(node);

    item.appendChild(el("h3", "timeline__title", evt.title));

    var meta = metaText(evt);
    if (meta) {
      item.appendChild(el("p", "timeline__meta", meta));
    }

    if (evt.description) {
      item.appendChild(el("p", "timeline__desc", evt.description));
    }

    frag.appendChild(item);
    count++;
  });

  if (count === 0) {
    /* No configured events — keep the section hidden entirely */
    section.setAttribute("hidden", "");
    return;
  }

  list.appendChild(frag);
})();
