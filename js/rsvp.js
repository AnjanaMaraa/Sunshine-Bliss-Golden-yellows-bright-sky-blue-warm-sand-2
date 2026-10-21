/* ==========================================================================
   rsvp.js — RSVP form
   - Accessible validation with inline, announced error messages
   - Duplicate submissions blocked while processing
   - Submission logic isolated in submitRsvp(): swap the stub for a real
     endpoint (fetch) / email service / WhatsApp handler later.
   - HONESTY: with no backend configured the UI states clearly that the
     response was only stored locally on this device (demo mode).
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("rsvpForm");
  if (!form) return;

  var data = window.invitationData || {};
  if (data.rsvp && data.rsvp.enabled === false) {
    var section = document.getElementById("rsvp");
    if (section) section.setAttribute("hidden", "");
    return;
  }

  var nameInput = document.getElementById("rsvpName");
  var messageInput = document.getElementById("rsvpMessage");
  var nameError = document.getElementById("rsvpNameError");
  var attendError = document.getElementById("rsvpAttendError");
  var statusEl = document.getElementById("rsvpStatus");
  var submitBtn = document.getElementById("rsvpSubmit");

  var isSubmitting = false;

  /* ------------------------------------------------------------------
     SUBMISSION ADAPTER — replace the body of this function to go live.
     ------------------------------------------------------------------ */
  function submitRsvp(payload) {
    /* DEMO / LOCAL MODE: store the response in this browser only.
       To deliver RSVPs to the couple, POST `payload` to your backend:

         return fetch("https://your-api.example.com/rsvp", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(payload)
         }).then(r => r.json());

       Until then, never claim the RSVP was sent to the couple. */
    return new Promise(function (resolve) {
      try {
        var key = "raju-aishu-rsvp-demo";
        var saved = JSON.parse(localStorage.getItem(key) || "[]");
        saved.push(Object.assign({ savedAt: new Date().toISOString() }, payload));
        localStorage.setItem(key, JSON.stringify(saved));
      } catch (err) {
        /* private mode / storage full — demo still resolves */
      }
      setTimeout(function () {
        resolve({ ok: true, demo: true });
      }, 500);
    });
  }

  /* ------------------------------------------------------------------ */
  function showError(input, errorEl, message) {
    if (input) input.setAttribute("aria-invalid", "true");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.removeAttribute("hidden");
    }
  }

  function clearError(input, errorEl) {
    if (input) input.removeAttribute("aria-invalid");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.setAttribute("hidden", "");
    }
  }

  function selectedAttendance() {
    var checked = form.querySelector('input[name="attendance"]:checked');
    return checked ? checked.value : null;
  }

  function validate() {
    var firstInvalid = null;

    /* Name */
    var name = nameInput.value.trim();
    if (!name) {
      showError(nameInput, nameError, "Please tell us your name.");
      firstInvalid = firstInvalid || nameInput;
    } else if (name.length < 2) {
      showError(nameInput, nameError, "Please enter at least 2 characters.");
      firstInvalid = firstInvalid || nameInput;
    } else {
      clearError(nameInput, nameError);
    }

    /* Attendance */
    if (!selectedAttendance()) {
      attendError.textContent = "Please let us know if you will be attending.";
      attendError.removeAttribute("hidden");
      var firstRadio = form.querySelector('input[name="attendance"]');
      firstInvalid = firstInvalid || firstRadio;
    } else {
      clearError(null, attendError);
    }

    return firstInvalid;
  }

  /* Live-clear errors as the guest fixes them */
  nameInput.addEventListener("input", function () {
    if (nameInput.getAttribute("aria-invalid")) clearError(nameInput, nameError);
  });
  form.querySelectorAll('input[name="attendance"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      clearError(null, attendError);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (isSubmitting) return; /* prevent duplicate submissions */

    statusEl.textContent = "";
    statusEl.className = "rsvp-form__status";

    var firstInvalid = validate();
    if (firstInvalid) {
      statusEl.textContent = "Please complete the highlighted fields.";
      statusEl.classList.add("is-error");
      firstInvalid.focus();
      return;
    }

    var payload = {
      name: nameInput.value.trim(),
      attendance: selectedAttendance(),
      message: messageInput.value.trim()
    };

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending\u2026";

    submitRsvp(payload)
      .then(function (result) {
        if (result && result.ok) {
          statusEl.classList.add("is-success");
          statusEl.textContent =
            "Thank you, " + payload.name + "! \u2605 " +
            (result.demo
              ? "Your RSVP has been saved on this device only (demo mode) — " +
                "connect a backend service (see README) to deliver responses " +
                "to the couple."
              : "Your RSVP has been delivered.");
          form.reset();
        } else {
          throw new Error("Unexpected response");
        }
      })
      .catch(function () {
        statusEl.classList.add("is-error");
        statusEl.textContent =
          "We could not save your RSVP right now. Please try again.";
      })
      .finally(function () {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Send RSVP";
      });
  });
})();
