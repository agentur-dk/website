/* =============================================================================
   quiz.js — Bedarfs-Check-Quiz als KI-Chat (Startseite Hero)
   Vanilla ES2020, IIFE, no dependencies, no page reload.
   Ablauf: KI-Frage 1 (Thema) → User-Bubble → Tipp-Indikator →
           KI-Frage 2 (Dringlichkeit) → User-Bubble → Tipp-Indikator → Ergebnis
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

  const TOPICS = [
    { key: 'mehr_umsatz',  label: 'Mehr Umsatz & Anfragen' },
    { key: 'mitarbeiter',  label: 'Neue Mitarbeiter gewinnen' },
    { key: 'bfsg',         label: 'BFSG & Barrierefreiheit' },
    { key: 'sichtbarkeit', label: 'Mehr Sichtbarkeit online' },
    { key: 'marke',        label: 'Stärkere Marke aufbauen' },
  ];

  // ---------------------------------------------------------------------------
  // State & DOM-Refs
  // ---------------------------------------------------------------------------
  let selectedTopic = null;

  const chatLog      = widget.querySelector('.quiz-chat__log');
  const liveRegion   = widget.querySelector('.quiz-widget__live');
  const restartBtn   = widget.querySelector('.quiz-chat__restart-btn');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TYPING_DELAY   = 700; // ms

  // ---------------------------------------------------------------------------
  // Hilfsfunktionen
  // ---------------------------------------------------------------------------
  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    requestAnimationFrame(function () { liveRegion.textContent = msg; });
  }

  function track(obj) {
    if (window.dataLayer) window.dataLayer.push(obj);
  }

  function scrollLog() {
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // ---------------------------------------------------------------------------
  // Bubble-Renderer
  // ---------------------------------------------------------------------------
  function appendAIBubble(text) {
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--ai';
    el.textContent = text;
    chatLog.appendChild(el);
    scrollLog();
    return el;
  }

  function appendUserBubble(text) {
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--user';
    el.textContent = text;
    chatLog.appendChild(el);
    scrollLog();
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'chat-msg chat-msg--ai chat-typing';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span></span><span></span><span></span>';
    chatLog.appendChild(el);
    scrollLog();
    return function removeTyping() {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }

  // Hängt Quick-Reply-Chips an; gibt den ersten Button zurück (für Fokus-Management).
  function appendQuickReplies(groupLabel, options) {
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-replies';

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'chat-replies__fieldset';

    const legend = document.createElement('legend');
    legend.className = 'u-sr-only';
    legend.textContent = groupLabel;
    fieldset.appendChild(legend);

    options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = opt.label;

      btn.addEventListener('click', function () {
        // Alle Chips deaktivieren und gewählten markieren
        fieldset.querySelectorAll('.quiz-option').forEach(function (b) {
          b.setAttribute('aria-pressed', 'false');
          b.disabled = true;
        });
        btn.setAttribute('aria-pressed', 'true');
        opt.onSelect();
      });

      fieldset.appendChild(btn);
    });

    wrapper.appendChild(fieldset);
    chatLog.appendChild(wrapper);
    scrollLog();

    return fieldset.querySelector('.quiz-option');
  }

  // ---------------------------------------------------------------------------
  // Schritt 1: Thema wählen
  // ---------------------------------------------------------------------------
  function renderStep1(initial) {
    chatLog.innerHTML = '';
    selectedTopic = null;
    delete widget.dataset.quizTopic;
    delete widget.dataset.quizUrgency;

    appendAIBubble('Was brauchst du am dringendsten?');

    const options = TOPICS.map(function (topic) {
      return {
        label: topic.label,
        onSelect: function () {
          selectedTopic = topic.key;
          widget.dataset.quizTopic = topic.key;
          track({ event: 'quiz_answer', question: 'need', answer: topic.key });

          appendUserBubble(topic.label);

          if (prefersReduced) {
            renderStep2();
          } else {
            const removeTyping = showTyping();
            setTimeout(function () {
              removeTyping();
              renderStep2();
            }, TYPING_DELAY);
          }
        },
      };
    });

    const firstBtn = appendQuickReplies('Was brauchst du am dringendsten?', options);

    // Fokus nur bei Nutzeraktion (Neu starten), nicht beim initialen Laden
    if (!initial) {
      firstBtn.focus({ preventScroll: true });
    }
  }

  // ---------------------------------------------------------------------------
  // Schritt 2: Dringlichkeit wählen
  // ---------------------------------------------------------------------------
  function renderStep2() {
    announce('Frage 2 von 2');

    appendAIBubble('Wie schnell willst du loslegen?');

    const urgencies = [
      { key: 'sofort',      label: 'Sofort loslegen' },
      { key: 'informieren', label: 'Erstmal informieren' },
    ];

    const options = urgencies.map(function (u) {
      return {
        label: u.label,
        onSelect: function () {
          widget.dataset.quizUrgency = u.key;

          const target = u.key === 'sofort'
            ? '#contact'
            : QUIZ_MAP[selectedTopic].href;

          track({ event: 'quiz_answer',   question: 'urgency', answer: u.key });
          track({ event: 'quiz_complete', topic: selectedTopic, target: target });

          appendUserBubble(u.label);

          if (prefersReduced) {
            renderResult(u.key);
          } else {
            const removeTyping = showTyping();
            setTimeout(function () {
              removeTyping();
              renderResult(u.key);
            }, TYPING_DELAY);
          }
        },
      };
    });

    const firstBtn = appendQuickReplies('Wie schnell willst du loslegen?', options);
    firstBtn.focus({ preventScroll: true });
  }

  // ---------------------------------------------------------------------------
  // Ergebnis anzeigen
  // ---------------------------------------------------------------------------
  function renderResult(urgency) {
    const service = QUIZ_MAP[selectedTopic];
    announce('Ergebnis: ' + service.title);

    // Ergebnis-Bubble (KI-Seite)
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg chat-msg--ai chat-msg--result';

    const titleEl = document.createElement('p');
    titleEl.className = 'chat-result__title';
    titleEl.setAttribute('tabindex', '-1');
    titleEl.textContent = 'Das passt zu dir: ' + service.title;

    const blurbEl = document.createElement('p');
    blurbEl.className = 'chat-result__blurb';
    blurbEl.textContent = service.blurb;

    bubble.appendChild(titleEl);
    bubble.appendChild(blurbEl);
    chatLog.appendChild(bubble);

    // Aktions-Buttons unter der Bubble
    const actions = document.createElement('div');
    actions.className = 'chat-result__actions';

    const primaryBtn = document.createElement('a');
    primaryBtn.className = 'btn btn--primary';
    if (urgency === 'sofort') {
      primaryBtn.href = '#contact';
      primaryBtn.textContent = 'Projekt anfragen';
    } else {
      primaryBtn.href = service.href;
      primaryBtn.textContent = 'Mehr erfahren';
    }

    const secondaryBtn = document.createElement('a');
    secondaryBtn.className = 'btn btn--outline';
    if (urgency === 'sofort') {
      secondaryBtn.href = service.href;
      secondaryBtn.textContent = 'Mehr erfahren';
    } else {
      secondaryBtn.href = '#contact';
      secondaryBtn.textContent = 'Projekt anfragen';
    }

    actions.appendChild(primaryBtn);
    actions.appendChild(secondaryBtn);
    chatLog.appendChild(actions);

    scrollLog();
    titleEl.focus({ preventScroll: true });
  }

  // ---------------------------------------------------------------------------
  // Neu starten (Header-Button)
  // ---------------------------------------------------------------------------
  restartBtn.addEventListener('click', function () {
    renderStep1(false);
  });

  // ---------------------------------------------------------------------------
  // Start — kein initialer Fokus, kein Auto-Scroll
  // ---------------------------------------------------------------------------
  renderStep1(true);
})();
