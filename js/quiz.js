/* =============================================================================
   quiz.js — Bedarfs-Check-Quiz (Startseite Hero)
   Vanilla ES2020, IIFE, no dependencies, no page reload.
   Ablauf: Frage 1 (Thema, 5 Optionen) → Frage 2 (Dringlichkeit, 2 Optionen) → Ergebnis
   ============================================================================= */

(function initQuiz() {
  'use strict';

  const widget = document.querySelector('[data-quiz]');
  if (!widget) return;

  // ---------------------------------------------------------------------------
  // Mapping: Topic-Key → Service-Daten (leicht erweiterbar)
  // ---------------------------------------------------------------------------
  const QUIZ_MAP = {
    mehr_umsatz:  {
      title: 'Online-Marketing',
      href:  'online-marketing.html',
      blurb: 'Kampagnen, Ads & Conversion – mehr Anfragen und Umsatz.',
    },
    mitarbeiter:  {
      title: 'Social Recruiting',
      href:  'social-recruiting.html',
      blurb: 'Zielgruppengenau neue Mitarbeiter finden.',
    },
    bfsg:         {
      title: 'BFSG & Barrierefreiheit',
      href:  'bfsg-wordpress-website-agentur.html',
      blurb: 'Rechtssichere digitale Barrierefreiheit nach EN 301 549 / WCAG.',
    },
    sichtbarkeit: {
      title: 'SEO & GEO',
      href:  'seo-geo.html',
      blurb: 'Besser gefunden werden – in Suchmaschinen und KI-Antworten.',
    },
    marke:        {
      title: 'Corporate Design',
      href:  'corporate-design.html',
      blurb: 'Markenauftritt, der bleibt und überzeugt.',
    },
  };

  // Reihenfolge & Labels der Frage-1-Optionen
  const TOPICS = [
    { key: 'mehr_umsatz',  label: 'Mehr Umsatz & Anfragen' },
    { key: 'mitarbeiter',  label: 'Neue Mitarbeiter gewinnen' },
    { key: 'bfsg',         label: 'BFSG & Barrierefreiheit' },
    { key: 'sichtbarkeit', label: 'Mehr Sichtbarkeit online' },
    { key: 'marke',        label: 'Stärkere Marke aufbauen' },
  ];

  // ---------------------------------------------------------------------------
  // Interne State
  // ---------------------------------------------------------------------------
  let selectedTopic = null;

  const body       = widget.querySelector('.quiz-widget__body');
  const liveRegion = widget.querySelector('.quiz-widget__live');

  // ---------------------------------------------------------------------------
  // Hilfsfunktionen
  // ---------------------------------------------------------------------------
  function announce(msg) {
    if (liveRegion) {
      // Kurzer Reset damit aria-live auch bei gleicher Nachricht triggert
      liveRegion.textContent = '';
      requestAnimationFrame(function () { liveRegion.textContent = msg; });
    }
  }

  function focusHeading(container) {
    const h = container.querySelector('[tabindex="-1"]');
    if (h) h.focus({ preventScroll: true });
  }

  function track(obj) {
    if (window.dataLayer) window.dataLayer.push(obj);
  }

  // ---------------------------------------------------------------------------
  // Schritt 1: Thema wählen
  // ---------------------------------------------------------------------------
  function renderStep1(initial) {
    body.innerHTML = '';

    const section = document.createElement('section');
    section.setAttribute('aria-label', 'Frage 1 von 2');

    // Überschrift (Fokus-Ziel nach Neu-Starten)
    const heading = document.createElement('h2');
    heading.className = 'quiz-widget__question';
    heading.setAttribute('tabindex', '-1');
    heading.textContent = 'Was brauchst du am dringendsten?';
    section.appendChild(heading);

    // Fieldset gruppiert die Optionen semantisch
    const fieldset = document.createElement('fieldset');
    fieldset.style.border = 'none';
    fieldset.style.padding = '0';
    fieldset.style.margin  = '0';

    const legend = document.createElement('legend');
    legend.className = 'u-sr-only';
    legend.textContent = 'Was brauchst du am dringendsten?';
    fieldset.appendChild(legend);

    const grid = document.createElement('div');
    grid.className = 'quiz-options';

    TOPICS.forEach(function (topic) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.dataset.quizTopic = topic.key;
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = topic.label;

      btn.addEventListener('click', function () {
        selectedTopic = topic.key;
        widget.dataset.quizTopic = topic.key;

        // Visuelles Feedback: pressed-State kurz sichtbar lassen
        grid.querySelectorAll('.quiz-option').forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
          b.classList.remove('is-selected');
        });
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('is-selected');

        track({ event: 'quiz_answer', question: 'need', answer: topic.key });

        setTimeout(renderStep2, 180);
      });

      grid.appendChild(btn);
    });

    fieldset.appendChild(grid);
    section.appendChild(fieldset);
    body.appendChild(section);

    // Fokus nur bei Nutzeraktion (Neu starten), nicht beim initialen Laden
    if (!initial) { focusHeading(section); }
  }

  // ---------------------------------------------------------------------------
  // Schritt 2: Dringlichkeit wählen
  // ---------------------------------------------------------------------------
  function renderStep2() {
    body.innerHTML = '';
    announce('Frage 2 von 2');

    const section = document.createElement('section');
    section.setAttribute('aria-label', 'Frage 2 von 2');

    const heading = document.createElement('h2');
    heading.className = 'quiz-widget__question';
    heading.setAttribute('tabindex', '-1');
    heading.textContent = 'Wie schnell willst du loslegen?';
    section.appendChild(heading);

    const fieldset = document.createElement('fieldset');
    fieldset.style.border = 'none';
    fieldset.style.padding = '0';
    fieldset.style.margin  = '0';

    const legend = document.createElement('legend');
    legend.className = 'u-sr-only';
    legend.textContent = 'Wie schnell willst du loslegen?';
    fieldset.appendChild(legend);

    const grid = document.createElement('div');
    grid.className = 'quiz-options quiz-options--2col';

    const urgencies = [
      { key: 'sofort',      label: 'Sofort loslegen' },
      { key: 'informieren', label: 'Erstmal informieren' },
    ];

    urgencies.forEach(function (u) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.dataset.quizUrgency = u.key;
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = u.label;

      btn.addEventListener('click', function () {
        widget.dataset.quizUrgency = u.key;

        const target = u.key === 'sofort'
          ? '#contact'
          : QUIZ_MAP[selectedTopic].href;

        track({ event: 'quiz_answer',   question: 'urgency', answer: u.key });
        track({ event: 'quiz_complete', topic: selectedTopic, target: target });

        renderResult(u.key);
      });

      grid.appendChild(btn);
    });

    fieldset.appendChild(grid);
    section.appendChild(fieldset);
    body.appendChild(section);

    focusHeading(section);
  }

  // ---------------------------------------------------------------------------
  // Ergebnis anzeigen
  // ---------------------------------------------------------------------------
  function renderResult(urgency) {
    const service = QUIZ_MAP[selectedTopic];
    body.innerHTML = '';
    announce('Ergebnis: ' + service.title);

    const result = document.createElement('div');
    result.className = 'quiz-result';

    const heading = document.createElement('h2');
    heading.className = 'quiz-result__title';
    heading.setAttribute('tabindex', '-1');
    heading.textContent = 'Das passt zu dir: ' + service.title;
    result.appendChild(heading);

    const blurb = document.createElement('p');
    blurb.className = 'quiz-result__blurb';
    blurb.textContent = service.blurb;
    result.appendChild(blurb);

    const actions = document.createElement('div');
    actions.className = 'quiz-result__actions';

    // Primär-Button: abhängig von Dringlichkeit
    const primaryBtn = document.createElement('a');
    primaryBtn.className = 'btn btn--primary';
    if (urgency === 'sofort') {
      primaryBtn.href = '#contact';
      primaryBtn.textContent = 'Projekt anfragen';
    } else {
      primaryBtn.href = service.href;
      primaryBtn.textContent = 'Mehr erfahren';
    }

    // Sekundär-Button: die jeweils andere Option
    const secondaryBtn = document.createElement('a');
    secondaryBtn.className = 'btn btn--outline';
    if (urgency === 'sofort') {
      secondaryBtn.href = service.href;
      secondaryBtn.textContent = 'Mehr erfahren';
    } else {
      secondaryBtn.href = '#contact';
      secondaryBtn.textContent = 'Projekt anfragen';
    }

    // Neu-Starten-Button
    const restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.className = 'btn btn--ghost';
    restartBtn.textContent = 'Neu starten';
    restartBtn.addEventListener('click', function () {
      selectedTopic = null;
      delete widget.dataset.quizTopic;
      delete widget.dataset.quizUrgency;
      renderStep1();
    });

    actions.appendChild(primaryBtn);
    actions.appendChild(secondaryBtn);
    actions.appendChild(restartBtn);
    result.appendChild(actions);
    body.appendChild(result);

    focusHeading(result);
  }

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  renderStep1(true);
})();
