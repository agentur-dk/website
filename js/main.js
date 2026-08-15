/* =============================================================================
   main.js — agentur dk
   Vanilla ES2020+, no dependencies, modular IIFE pattern.
   Modules: Year, SkipLink, Navigation, Accordion, Consent, ContactForm, BFSGCheck
   ============================================================================= */

'use strict';

/* ---------------------------------------------------------------------------
   Copyright Year
   --------------------------------------------------------------------------- */
(function initYear() {
  const el = document.getElementById('copyright-year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ---------------------------------------------------------------------------
   Skip Link — ensure programmatic focus on #main-content
   --------------------------------------------------------------------------- */
(function initSkipLink() {
  const link = document.querySelector('.skip-link');
  if (!link) return;

  link.addEventListener('click', function (e) {
    const target = document.getElementById('main-content');
    if (!target) return;
    e.preventDefault();
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: false });
    target.addEventListener('blur', function onBlur() {
      target.removeAttribute('tabindex');
      target.removeEventListener('blur', onBlur);
    }, { once: true });
  });
})();

/* ---------------------------------------------------------------------------
   Mobile Navigation
   --------------------------------------------------------------------------- */
(function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-primary');
  if (!toggle || !nav) return;

  function openNav() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    const firstLink = nav.querySelector('a, button');
    if (firstLink) firstLink.focus();
  }

  function closeNav() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.contains('is-open');
    isOpen ? closeNav() : openNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeNav();
      toggle.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      closeNav();
    }
  });

  const mq = window.matchMedia('(min-width: 769px)');
  mq.addEventListener('change', function (e) {
    if (e.matches) closeNav();
  });
})();

/* ---------------------------------------------------------------------------
   Accordion (FAQ)
   --------------------------------------------------------------------------- */
(function initAccordion() {
  const items = document.querySelectorAll('.accordion__item');
  if (!items.length) return;

  items.forEach(function (item) {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', function () {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      const accordion = item.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion__trigger').forEach(function (t) {
          if (t !== trigger) {
            t.setAttribute('aria-expanded', 'false');
            const p = t.closest('.accordion__item').querySelector('.accordion__panel');
            if (p) p.hidden = true;
          }
        });
      }

      trigger.setAttribute('aria-expanded', String(!isExpanded));
      panel.hidden = isExpanded;
    });
  });
})();

/* ---------------------------------------------------------------------------
   Typewriter Effect (hero greeting)
   Respects prefers-reduced-motion.
   --------------------------------------------------------------------------- */
(function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  const caret = document.querySelector('.typewriter-caret');
  if (!el) return;

  const texts = el.dataset.texts;
  if (!texts) return;

  let lines;
  try {
    lines = JSON.parse(texts);
  } catch (_) {
    return;
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    el.textContent = lines[0] || '';
    if (caret) caret.hidden = true;
    return;
  }

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;
  const SPEED_TYPE = 60;
  const SPEED_DELETE = 30;
  const PAUSE_END = 2200;
  const PAUSE_START = 500;

  function tick() {
    const current = lines[lineIndex];

    if (!deleting) {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
    }

    setTimeout(tick, deleting ? SPEED_DELETE : SPEED_TYPE);
  }

  setTimeout(tick, 400);
})();

/* ---------------------------------------------------------------------------
   Scroll-reveal (Intersection Observer)
   --------------------------------------------------------------------------- */
(function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();

/* ---------------------------------------------------------------------------
   Consent Management (DSGVO / GDPR)
   Uses localStorage only. No external scripts. No cookies.
   Categories: necessary (always on), statistics (opt-in)
   --------------------------------------------------------------------------- */
(function initConsent() {
  const STORAGE_KEY = 'dk_consent_v1';
  const banner = document.getElementById('consent-banner');
  const modal = document.getElementById('consent-modal');
  if (!banner) return;

  function getConsent() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (_) {
      return null;
    }
  }

  function saveConsent(settings) {
    settings.timestamp = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function applyConsent(settings) {
    document.dispatchEvent(new CustomEvent('dk:consent', { detail: settings }));
  }

  function hideBanner() { banner.hidden = true; }
  function hideModal() { if (modal) modal.hidden = true; }

  const existing = getConsent();
  if (existing) {
    hideBanner();
    applyConsent(existing);
  } else {
    banner.hidden = false;
  }

  const acceptAllBtn = document.getElementById('consent-accept-all');
  if (acceptAllBtn) {
    acceptAllBtn.addEventListener('click', function () {
      const s = { necessary: true, statistics: true };
      saveConsent(s); applyConsent(s); hideBanner(); hideModal();
    });
  }

  const acceptNecessaryBtn = document.getElementById('consent-necessary-only');
  if (acceptNecessaryBtn) {
    acceptNecessaryBtn.addEventListener('click', function () {
      const s = { necessary: true, statistics: false };
      saveConsent(s); applyConsent(s); hideBanner(); hideModal();
    });
  }

  const settingsBtn = document.getElementById('consent-open-settings');
  if (settingsBtn && modal) {
    settingsBtn.addEventListener('click', function () {
      modal.hidden = false;
      const first = modal.querySelector('button, input, a');
      if (first) first.focus();
    });
  }

  const saveSettingsBtn = document.getElementById('consent-save-settings');
  if (saveSettingsBtn && modal) {
    saveSettingsBtn.addEventListener('click', function () {
      const statsToggle = document.getElementById('consent-toggle-statistics');
      const s = { necessary: true, statistics: statsToggle ? statsToggle.checked : false };
      saveConsent(s); applyConsent(s); hideBanner(); hideModal();
    });
  }

  const closeModalBtn = document.getElementById('consent-modal-close');
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', function () {
      hideModal();
      if (settingsBtn) settingsBtn.focus();
    });
  }

  if (modal) {
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideModal();
        if (settingsBtn) settingsBtn.focus();
      }
    });
  }

  window.dkConsent = {
    revoke: function () {
      localStorage.removeItem(STORAGE_KEY);
      banner.hidden = false;
      const first = banner.querySelector('button');
      if (first) first.focus();
    },
    getConsent: getConsent,
  };
})();

/* ---------------------------------------------------------------------------
   Contact Form — Client-side validation & fetch submission
   --------------------------------------------------------------------------- */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('[type="submit"]');

  function setError(input, errorEl, message) {
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = message;
      input.setAttribute('aria-describedby', (input.getAttribute('aria-describedby') || '') + ' ' + errorEl.id);
    }
  }

  function clearError(input, errorEl) {
    input.removeAttribute('aria-invalid');
    if (errorEl) errorEl.textContent = '';
  }

  function validateField(input) {
    const errorEl = document.getElementById(input.id + '-error');
    const value = input.value.trim();

    if (input.required && !value) {
      setError(input, errorEl, 'Dieses Feld ist erforderlich.');
      return false;
    }
    if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(input, errorEl, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return false;
    }
    if (input.minLength > 0 && value.length < input.minLength) {
      setError(input, errorEl, 'Bitte mindestens ' + input.minLength + ' Zeichen eingeben.');
      return false;
    }
    clearError(input, errorEl);
    return true;
  }

  form.querySelectorAll('input, textarea, select').forEach(function (field) {
    field.addEventListener('blur', function () { validateField(field); });
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fields = Array.from(form.querySelectorAll('input[required], textarea[required], select[required]'));
    const valid = fields.map(validateField).every(Boolean);
    if (!valid) {
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

    const honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet\u2026';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        if (statusEl) {
          statusEl.className = 'form-status form-status--success';
          statusEl.textContent = 'Vielen Dank! Ihre Nachricht wurde gesendet. Wir melden uns innerhalb von 24 Stunden.';
          statusEl.hidden = false;
          statusEl.setAttribute('tabindex', '-1');
          statusEl.focus();
        }
        form.reset();
      } else {
        throw new Error('Server error');
      }
    } catch (_) {
      if (statusEl) {
        statusEl.className = 'form-status form-status--error';
        statusEl.textContent = 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie direkt an mail@dk-dk.de.';
        statusEl.hidden = false;
        statusEl.setAttribute('tabindex', '-1');
        statusEl.focus();
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Nachricht senden';
    }
  });
})();

/* ---------------------------------------------------------------------------
   BFSG Self-Check (bfsg-wordpress-website-agentur.html only)
   --------------------------------------------------------------------------- */
(function initBFSGCheck() {
  const form = document.getElementById('bfsg-check-form');
  if (!form) return;

  const resultContainer = document.getElementById('bfsg-check-result');
  const liveRegion = document.getElementById('bfsg-live-region');
  const steps = Array.from(form.querySelectorAll('.bfsg-step'));
  const progressEl = document.getElementById('bfsg-progress');
  let currentStep = 0;

  function showStep(index) {
    steps.forEach(function (step, i) { step.hidden = i !== index; });
    if (progressEl) progressEl.textContent = 'Schritt ' + (index + 1) + ' von ' + steps.length;
    const heading = steps[index] && steps[index].querySelector('[tabindex="-1"]');
    if (heading) heading.focus();
  }

  function validateCurrentStep() {
    const step = steps[currentStep];
    const radios = step.querySelectorAll('input[type="radio"]');
    if (!radios.length) return true;
    const name = radios[0].name;
    if (!form.querySelector('input[name="' + name + '"]:checked')) {
      const errorEl = step.querySelector('.step-error');
      if (errorEl) { errorEl.textContent = 'Bitte wählen Sie eine Antwort aus.'; errorEl.hidden = false; }
      radios[0].focus();
      return false;
    }
    const errorEl = step.querySelector('.step-error');
    if (errorEl) { errorEl.textContent = ''; errorEl.hidden = true; }
    return true;
  }

  form.querySelectorAll('[data-next]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!validateCurrentStep()) return;
      if (currentStep < steps.length - 1) { currentStep++; showStep(currentStep); }
    });
  });

  form.querySelectorAll('[data-prev]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (currentStep > 0) { currentStep--; showStep(currentStep); }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    const checked = Array.from(form.querySelectorAll('input[type="radio"]:checked'));
    const riskCount = checked.filter(function (r) { return r.value === 'ja'; }).length;
    const total = steps.length;

    let cls, headline, body;

    if (riskCount >= Math.ceil(total * 0.6)) {
      cls = 'check-result--action';
      headline = 'Handlungsbedarf: BFSG-Konformität gefährdet';
      body = riskCount + ' von ' + total + ' Punkten zeigen kritischen Bedarf. Das BFSG verpflichtet ab dem 28. Juni 2025 zur Barrierefreiheit. Wir empfehlen eine professionelle Prüfung.';
    } else if (riskCount >= Math.ceil(total * 0.3)) {
      cls = 'check-result--review';
      headline = 'Teilweiser Handlungsbedarf erkannt';
      body = riskCount + ' von ' + total + ' Punkten zeigen Verbesserungspotenzial. Gezielte Optimierungen sichern Ihre BFSG-Konformität. Wir analysieren kostenlos.';
    } else {
      cls = 'check-result--good';
      headline = 'Gut aufgestellt — Details prüfen lassen';
      body = 'Nur ' + riskCount + ' von ' + total + ' Punkten weisen auf mögliche Lücken hin. Eine professionelle Einzelprüfung schafft rechtliche Sicherheit.';
    }

    if (resultContainer) {
      resultContainer.className = 'check-result ' + cls;
      const h = resultContainer.querySelector('.check-result__headline');
      const b = resultContainer.querySelector('.check-result__body');
      if (h) h.textContent = headline;
      if (b) b.textContent = body;
      resultContainer.hidden = false;
      resultContainer.setAttribute('tabindex', '-1');
      resultContainer.focus();
    }

    if (liveRegion) liveRegion.textContent = 'Auswertung abgeschlossen: ' + headline;
    steps.forEach(function (s) { s.hidden = true; });
  });

  showStep(0);
})();
