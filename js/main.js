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

  // Ausnahme: Datenschutz & Impressum sind ohne Zwangs-Banner nutzbar
  const exemptPath = /(datenschutz|impressum)\.html/.test(window.location.pathname);
  let lastFocused = null;

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

  function lockScroll() { document.body.style.overflow = 'hidden'; }
  function unlockScroll() { document.body.style.overflow = ''; }

  function getFocusables() {
    return Array.from(banner.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  }

  function openBanner() {
    banner.hidden = false;
    lockScroll();
    lastFocused = document.activeElement;
    const first = getFocusables()[0];
    if (first) first.focus();
  }

  function closeBanner() {
    banner.hidden = true;
    unlockScroll();
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function hideBanner() { banner.hidden = true; }
  function hideModal() { if (modal) modal.hidden = true; }

  const existing = getConsent();
  if (existing) {
    hideBanner();
    applyConsent(existing);
  } else if (!exemptPath) {
    // Zwingendes Modal: Seite erst nach Entscheidung nutzbar (Scroll-Lock + Fokus)
    banner.hidden = false;
    lockScroll();
    requestAnimationFrame(function () {
      const first = getFocusables()[0];
      if (first) first.focus();
    });
  } else {
    hideBanner();
  }

  // Fokus-Trap solange das Modal offen ist
  banner.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusables = getFocusables();
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  const acceptAllBtn = document.getElementById('consent-accept-all');
  if (acceptAllBtn) {
    acceptAllBtn.addEventListener('click', function () {
      const s = { necessary: true, statistics: true };
      saveConsent(s); applyConsent(s); closeBanner(); hideModal();
    });
  }

  const acceptNecessaryBtn = document.getElementById('consent-necessary-only');
  if (acceptNecessaryBtn) {
    acceptNecessaryBtn.addEventListener('click', function () {
      const s = { necessary: true, statistics: false };
      saveConsent(s); applyConsent(s); closeBanner(); hideModal();
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
      saveConsent(s); applyConsent(s); closeBanner(); hideModal();
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
      openBanner();
    },
    getConsent: getConsent,
  };
})();

/* ---------------------------------------------------------------------------
   Contact Form — Client-side validation, multi-step navigation & fetch
   --------------------------------------------------------------------------- */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = form.querySelector('[type="submit"]');
  const steps = Array.from(form.querySelectorAll('.form-step'));
  const indicators = Array.from(form.querySelectorAll('[data-step-indicator]'));
  const isMultiStep = steps.length > 0;
  let currentStep = 0;

  // DSGVO-konformer Spam-Schutz (kein Google/ReCaptcha, keine IP-Nutzung):
  // 1) Honeypot-Feld (_gotcha) – nur Bots füllen es aus
  // 2) Zeitstempel: Formular in <2,5s ausgefüllt = Bot → still verwerfen
  const startedField = document.getElementById('form-started');
  if (startedField) startedField.value = String(Date.now());

  // „Sonstiges“-Checkbox blendet Freitextfeld ein
  const otherTrigger = form.querySelector('[data-other-trigger]');
  const otherField = form.querySelector('[data-other-field]');
  if (otherTrigger && otherField) {
    otherTrigger.addEventListener('change', function () {
      otherField.hidden = !otherTrigger.checked;
      if (otherTrigger.checked) {
        const input = otherField.querySelector('input, textarea');
        if (input) input.focus();
      }
    });
  }

  function setError(input, errorEl, message) {
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      input.setAttribute('aria-describedby', (input.getAttribute('aria-describedby') || '') + ' ' + errorEl.id);
    }
  }

  function clearError(input, errorEl) {
    input.removeAttribute('aria-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
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
    if (input.type === 'url' && value && !/^https?:\/\//i.test(value)) {
      setError(input, errorEl, 'Bitte geben Sie eine vollständige URL an (https://…).');
      return false;
    }
    if (input.minLength > 0 && value.length < input.minLength) {
      setError(input, errorEl, 'Bitte mindestens ' + input.minLength + ' Zeichen eingeben.');
      return false;
    }
    clearError(input, errorEl);
    return true;
  }

  function validateStep(stepIndex) {
    const step = steps[stepIndex];
    if (!step) return true;
    const fields = Array.from(step.querySelectorAll('input, textarea, select'));
    return fields.map(validateField).every(Boolean);
  }

  function updateIndicators() {
    indicators.forEach(function (ind, i) {
      ind.classList.toggle('is-active', i === currentStep);
      ind.classList.toggle('is-done', i < currentStep);
      if (i === currentStep) ind.setAttribute('aria-current', 'step');
      else ind.removeAttribute('aria-current');
    });
  }

  function showStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    steps.forEach(function (step, i) { step.hidden = i !== index; });
    updateIndicators();
    const firstField = steps[index].querySelector('input, textarea, select');
    if (firstField) firstField.focus({ preventScroll: true });
  }

  // Validierung bei blur/input (nur Felder des aktiven Schritts)
  form.querySelectorAll('input, textarea, select').forEach(function (field) {
    field.addEventListener('blur', function () {
      const step = field.closest('.form-step');
      if (!isMultiStep || (step && steps.indexOf(step) === currentStep)) validateField(field);
    });
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  // Multi-Step-Navigation
  if (isMultiStep) {
    form.querySelectorAll('[data-step-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!validateStep(currentStep)) {
          const firstInvalid = steps[currentStep].querySelector('[aria-invalid="true"]');
          if (firstInvalid) firstInvalid.focus();
          return;
        }
        if (currentStep < steps.length - 1) showStep(currentStep + 1);
      });
    });

    form.querySelectorAll('[data-step-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (currentStep > 0) showStep(currentStep - 1);
      });
    });

    // Enter in Inputs löst „Weiter“ aus statt direktem Submit
    form.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]), select').forEach(function (field) {
      field.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const next = steps[currentStep] && steps[currentStep].querySelector('[data-step-next]');
          if (next) next.click();
        }
      });
    });

    showStep(0);
  }

  function isLikelyBot() {
    // Honeypot gefüllt?
    const honeypot = form.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) return true;
    // Zu schnell ausgefüllt (< 2,5 s seit Seitenaufbau)?
    if (startedField && startedField.value) {
      const elapsed = Date.now() - parseInt(startedField.value, 10);
      if (elapsed < 2500) return true;
    }
    return false;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Spam-Schutz: Bots still verwerfen (keine Fehlermeldung, die Bots trainiert)
    if (isLikelyBot()) {
      if (statusEl) {
        statusEl.className = 'form-status form-status--success';
        statusEl.textContent = 'Vielen Dank! Ihre Nachricht wurde gesendet.';
        statusEl.hidden = false;
      }
      form.reset();
      if (isMultiStep) showStep(0);
      return;
    }

    const fields = Array.from(form.querySelectorAll('input[required], textarea[required], select[required]'));
    const valid = fields.map(validateField).every(Boolean);
    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) {
        const step = firstInvalid.closest('.form-step');
        if (isMultiStep && step) showStep(steps.indexOf(step));
        firstInvalid.focus();
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet\u2026';
    }

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
        if (isMultiStep) showStep(0);
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
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Anfrage senden';
      }
    }
  });
})();

/* ---------------------------------------------------------------------------
   Project Filter (projekte.html)
   Filter chips toggle aria-pressed; AND logic across selected tags.
   Progressive enhancement: grid is visible without JS.
   --------------------------------------------------------------------------- */
(function initProjectFilter() {
  const filterGroup = document.getElementById('filter-group');
  if (!filterGroup) return;

  const chips = Array.from(filterGroup.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.case-card[data-tags]'));
  const statusEl = document.getElementById('filter-status');
  const allChip = filterGroup.querySelector('[data-filter="all"]');

  let activeFilters = new Set();

  function updateStatus(count) {
    if (!statusEl) return;
    const total = cards.length;
    statusEl.textContent = count === total
      ? total + ' Projekte angezeigt'
      : count + ' von ' + total + ' Projekten angezeigt';
  }

  function applyFilters() {
    let visible = 0;
    cards.forEach(function (card) {
      const tags = card.dataset.tags ? card.dataset.tags.split(' ') : [];
      const show = activeFilters.size === 0 ||
        Array.from(activeFilters).every(function (f) { return tags.includes(f); });
      card.hidden = !show;
      if (show) visible++;
    });
    updateStatus(visible);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const filter = chip.dataset.filter;

      if (filter === 'all') {
        activeFilters.clear();
        chips.forEach(function (c) {
          c.setAttribute('aria-pressed', String(c.dataset.filter === 'all'));
        });
      } else {
        const isPressed = chip.getAttribute('aria-pressed') === 'true';
        if (isPressed) {
          activeFilters.delete(filter);
          chip.setAttribute('aria-pressed', 'false');
        } else {
          activeFilters.add(filter);
          chip.setAttribute('aria-pressed', 'true');
        }
        if (allChip) {
          allChip.setAttribute('aria-pressed', String(activeFilters.size === 0));
        }
      }

      applyFilters();
    });
  });

  updateStatus(cards.length);
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
