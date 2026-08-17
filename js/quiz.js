/* =============================================================================
   quiz.js — Leistungs-Check (Startseite Hero)
   Vanilla ES2020, IIFE, no dependencies, no page reload.
   Flow: Step 1 (topic) → Step 2 (detail, optional) → Result + form prefill
   ============================================================================= */

(function initLeistungsCheck() {
  'use strict';

  const widget = document.querySelector('[data-quiz]');
  if (!widget) return;

  const inner      = widget.querySelector('[data-quiz-inner]');
  const liveRegion = widget.querySelector('.quiz-widget__live');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------
  const SERVICES = {
    mehr_umsatz: {
      title:     'Online-Marketing',
      href:      'online-marketing.html',
      blurb:     'Kampagnen, Ads & Conversion-Optimierung – für mehr Anfragen und messbaren Umsatz.',
      formValue: 'Online-Marketing',
    },
    mitarbeiter: {
      title:     'Social Recruiting',
      href:      'social-recruiting.html',
      blurb:     'Zielgruppengenau neue Mitarbeiter finden – auf den Plattformen, wo sie wirklich sind.',
      formValue: 'Social Recruiting',
    },
    bfsg: {
      title:     'BFSG & Barrierefreiheit',
      href:      'bfsg-wordpress-website-agentur.html',
      blurb:     'Rechtssichere digitale Barrierefreiheit nach WCAG 2.2 & EN 301 549 – bis zur BFSG-Deadline.',
      formValue: 'Barrierefreie Website (BFSG)',
    },
    sichtbarkeit: {
      title:     'SEO & GEO',
      href:      'seo-geo.html',
      blurb:     'Besser gefunden werden – in Suchmaschinen und KI-Antworten.',
      formValue: 'SEO & GEO',
    },
    marke: {
      title:     'Corporate Design',
      href:      'corporate-design.html',
      blurb:     'Markenauftritt, der bleibt und überzeugt – von Logo bis Styleguide.',
      formValue: 'Corporate Design',
    },
  };

  const STEP1_OPTIONS = [
    { key: 'mehr_umsatz',  label: 'Mehr Umsatz & Anfragen' },
    { key: 'mitarbeiter',  label: 'Neue Mitarbeiter gewinnen' },
    { key: 'bfsg',         label: 'BFSG & Barrierefreiheit' },
    { key: 'sichtbarkeit', label: 'Mehr Sichtbarkeit online' },
    { key: 'marke',        label: 'Stärkere Marke aufbauen' },
  ];

  // Topics with a detail step; bfsg and marke go directly to result.
  const STEP2_CONFIG = {
    mehr_umsatz: {
      question: 'Was ist dein Hauptziel?',
      options: [
        { key: 'anfragen',   label: 'Mehr Anfragen generieren' },
        { key: 'shop',       label: 'Produkte online verkaufen' },
        { key: 'optimieren', label: 'Bestehende Website optimieren' },
      ],
    },
    mitarbeiter: {
      question: 'Wen suchst du?',
      options: [
        { key: 'fachkraefte', label: 'Fachkräfte & Spezialisten' },
        { key: 'nachwuchs',   label: 'Azubis & Nachwuchs' },
        { key: 'mehrere',     label: 'Mehrere Stellen gleichzeitig' },
      ],
    },
    sichtbarkeit: {
      question: 'Wo möchtest du sichtbarer werden?',
      options: [
        { key: 'seo',    label: 'Google & Suchmaschinen (SEO)' },
        { key: 'geo',    label: 'KI-Suchen & AI-Antworten (GEO)' },
        { key: 'beides', label: 'Überall – beides gleichzeitig' },
      ],
    },
  };

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  let selectedTopic       = null;
  let selectedDetailLabel = null;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    requestAnimationFrame(function () { liveRegion.textContent = msg; });
  }

  function track(obj) {
    if (window.dataLayer) window.dataLayer.push(obj);
  }

  function focusFirst(container) {
    const el = container.querySelector('button');
    if (el) el.focus({ preventScroll: true });
  }

  function makeOptionBtn(label, compact, onSelect) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = compact ? 'lc-option lc-option--compact' : 'lc-option';
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = label;
    btn.addEventListener('click', function () { onSelect(); });
    return btn;
  }

  function backArrowSVG() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/></svg>';
  }

  // ---------------------------------------------------------------------------
  // Step 1 — Topic selection
  // ---------------------------------------------------------------------------
  function renderStep1(fromRestart) {
    selectedTopic = null;
    selectedDetailLabel = null;
    delete widget.dataset.quizTopic;
    delete widget.dataset.quizDetail;
    inner.innerHTML = '';

    const step = document.createElement('div');
    step.className = 'lc-step';

    const question = document.createElement('p');
    question.className = 'lc-question';
    question.textContent = 'Was möchtest du erreichen?';
    step.appendChild(question);

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'lc-fieldset';

    const legend = document.createElement('legend');
    legend.className = 'u-sr-only';
    legend.textContent = 'Was möchtest du erreichen?';
    fieldset.appendChild(legend);

    const grid = document.createElement('div');
    grid.className = 'lc-grid';
    fieldset.appendChild(grid);

    STEP1_OPTIONS.forEach(function (opt) {
      grid.appendChild(makeOptionBtn(opt.label, false, function () {
        selectedTopic = opt.key;
        widget.dataset.quizTopic = opt.key;
        track({ event: 'quiz_answer', question: 'need', answer: opt.key });
        announce('Gewählt: ' + opt.label);
        if (STEP2_CONFIG[opt.key]) {
          renderStep2(opt.key, opt.label);
        } else {
          renderResult();
        }
      }));
    });

    step.appendChild(fieldset);
    inner.appendChild(step);

    if (fromRestart) {
      focusFirst(step);
      announce('Leistungs-Check neu gestartet. Schritt 1: Was möchtest du erreichen?');
    }
  }

  // ---------------------------------------------------------------------------
  // Step 2 — Detail question
  // ---------------------------------------------------------------------------
  function renderStep2(topicKey, topicLabel) {
    inner.innerHTML = '';
    const cfg = STEP2_CONFIG[topicKey];

    announce('Schritt 2: ' + cfg.question);

    const step = document.createElement('div');
    step.className = 'lc-step';

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'lc-back';
    backBtn.innerHTML = backArrowSVG() + ' Zurück';
    backBtn.addEventListener('click', function () { renderStep1(true); });
    step.appendChild(backBtn);

    const breadcrumb = document.createElement('p');
    breadcrumb.className = 'lc-breadcrumb';
    breadcrumb.setAttribute('aria-hidden', 'true');
    breadcrumb.textContent = topicLabel + ' \u2192';
    step.appendChild(breadcrumb);

    const question = document.createElement('p');
    question.className = 'lc-question';
    question.textContent = cfg.question;
    step.appendChild(question);

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'lc-fieldset';

    const legend = document.createElement('legend');
    legend.className = 'u-sr-only';
    legend.textContent = cfg.question;
    fieldset.appendChild(legend);

    const grid = document.createElement('div');
    grid.className = 'lc-grid lc-grid--compact';
    fieldset.appendChild(grid);

    cfg.options.forEach(function (opt) {
      grid.appendChild(makeOptionBtn(opt.label, true, function () {
        selectedDetailLabel = opt.label;
        widget.dataset.quizDetail = opt.key;
        track({ event: 'quiz_answer', question: 'detail', answer: opt.key });
        announce('Gewählt: ' + opt.label + '. Lade Empfehlung …');
        renderResult();
      }));
    });

    step.appendChild(fieldset);
    inner.appendChild(step);
    focusFirst(step);
  }

  // ---------------------------------------------------------------------------
  // Step 3 — Result
  // ---------------------------------------------------------------------------
  function renderResult() {
    inner.innerHTML = '';
    const service = SERVICES[selectedTopic];
    announce('Deine Empfehlung: ' + service.title);
    track({ event: 'quiz_complete', topic: selectedTopic });

    const result = document.createElement('div');
    result.className = 'lc-result';

    const tag = document.createElement('span');
    tag.className = 'lc-result__tag';
    tag.setAttribute('aria-hidden', 'true');
    tag.textContent = 'Unsere Empfehlung';
    result.appendChild(tag);

    const title = document.createElement('p');
    title.className = 'lc-result__title';
    title.setAttribute('tabindex', '-1');
    title.textContent = service.title;
    result.appendChild(title);

    const blurb = document.createElement('p');
    blurb.className = 'lc-result__blurb';
    blurb.textContent = service.blurb;
    result.appendChild(blurb);

    const actions = document.createElement('div');
    actions.className = 'lc-result__actions';

    const ctaBtn = document.createElement('button');
    ctaBtn.type = 'button';
    ctaBtn.className = 'btn btn--accent';
    ctaBtn.textContent = 'Anfrage stellen';
    ctaBtn.addEventListener('click', function () { transferToForm(service); });
    actions.appendChild(ctaBtn);

    const learnLink = document.createElement('a');
    learnLink.href = service.href;
    learnLink.className = 'btn btn--outline';
    learnLink.textContent = 'Mehr erfahren';
    actions.appendChild(learnLink);

    result.appendChild(actions);

    const restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.className = 'lc-restart';
    restartBtn.textContent = '\u21BA Neu starten';
    restartBtn.addEventListener('click', function () { renderStep1(true); });
    result.appendChild(restartBtn);

    inner.appendChild(result);
    title.focus({ preventScroll: true });
  }

  // ---------------------------------------------------------------------------
  // Form prefill + scroll
  // ---------------------------------------------------------------------------
  function transferToForm(service) {
    const checkbox = document.querySelector(
      'input[name="interesse[]"][value="' + service.formValue + '"]'
    );
    if (checkbox) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const step1Option = STEP1_OPTIONS.find(function (o) { return o.key === selectedTopic; });
    const topicLabel = step1Option ? step1Option.label : service.title;
    const note = selectedDetailLabel
      ? 'Anfrage \u00FCber den Leistungs-Check: ' + topicLabel + ' \u2192 ' + selectedDetailLabel
      : 'Anfrage \u00FCber den Leistungs-Check: ' + topicLabel;

    const msgField = document.querySelector('#contact-message');
    if (msgField && !msgField.value) {
      msgField.value = note;
    }

    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: prefersReduced ? 'auto' : 'smooth',
        block: 'start',
      });
    }

    if (checkbox) {
      setTimeout(function () {
        checkbox.focus({ preventScroll: true });
      }, prefersReduced ? 0 : 600);
    }

    track({ event: 'quiz_cta_click', topic: selectedTopic });
  }

  // ---------------------------------------------------------------------------
  // Init — no auto-focus on initial load
  // ---------------------------------------------------------------------------
  renderStep1(false);
})();
