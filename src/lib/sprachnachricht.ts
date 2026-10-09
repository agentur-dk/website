/**
 * Die Wiedergabe der Sprachnachricht, gemeinsam für beide Auftritte
 * (Chatblase auf der Startseite, Knopf am Porträt auf „Über uns"), damit die
 * Logik nicht in zwei Abschriften auseinanderläuft. Gemeinsam ist nur
 * `<audio>` und Knopf; Wellenform, Punkt und Zeitanzeige sind freiwillig.
 */

/** Ein Element, das eine Sprachnachricht trägt. */
const TRAEGER = '[data-sprachnachricht]';

/**
 * Die Ankunft: Das Chatfenster gleitet beim ersten Sichtbarwerden einmal
 * herein; wer zurückscrollt, sieht eine fertige Nachricht. Mit abgeschalteter
 * Bewegung steht alles sofort da.
 */
export function ankunft(): void {
  const langsam = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pausiert = document.documentElement.dataset['motion'] === 'paused';

  for (const fenster of document.querySelectorAll<HTMLElement>('[data-sn-chat]')) {
    if (langsam.matches || pausiert) {
      fenster.classList.add('ist-da');
      continue;
    }
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) continue;
        fenster.classList.add('kommt-an');
        beobachter.unobserve(e.target);
      }
    }, { threshold: 0.4 });
    beobachter.observe(fenster);
  }
}

/**
 * Knopf, Audio und — wo vorhanden — Wellenform verbinden.
 *
 * Läuft eine Nachricht an, halten die anderen an: Zwei Stimmen
 * gleichzeitig sind kein Merkmal, sondern ein Fehler.
 */
export function verdrahte(): void {
  const alle = document.querySelectorAll<HTMLElement>(TRAEGER);

  for (const figur of alle) {
    /* Zweimal verdrahten hieße zwei Zuhörer je Ereignis — der Knopf
       würde starten und sofort wieder anhalten. */
    if (figur.dataset['verdrahtet'] !== undefined) continue;
    figur.dataset['verdrahtet'] = '';

    const audio = figur.querySelector<HTMLAudioElement>('[data-sn-audio]');
    const knopf = figur.querySelector<HTMLButtonElement>('[data-sn-knopf]');
    if (!audio || !knopf) continue;

    /* Freiwillig — nur die Chatblase hat sie. */
    const welle = figur.querySelector<HTMLElement>('[data-sn-welle]');
    const punkt = figur.querySelector<HTMLElement>('[data-sn-punkt]');
    const zeit = figur.querySelector<HTMLElement>('[data-sn-zeit]');

    const alsZeit = (s: number): string =>
      `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    /* Vor dem Abspielen steht die Länge da, während des Abspielens die
       gelaufene Zeit — so hält es der Messenger, und so erfährt man
       vorher, worauf man sich einlässt. */
    const zeichne = (): void => {
      const dauer = audio.duration || 1;
      const anteil = Math.min(1, audio.currentTime / dauer);
      figur.style.setProperty('--fortschritt', String(anteil));
      if (punkt) punkt.style.left = `${anteil * 100}%`;
      if (zeit) zeit.textContent = audio.currentTime > 0 ? alsZeit(audio.currentTime) : alsZeit(dauer);
      if (welle) {
        welle.setAttribute('aria-valuenow', String(Math.round(audio.currentTime)));
        welle.setAttribute('aria-valuetext', `${alsZeit(audio.currentTime)} von ${alsZeit(dauer)}`);
      }
    };

    const zeige = (laeuft: boolean): void => {
      knopf.setAttribute('aria-label', laeuft
        ? 'Sprachnachricht von Daniel Kontelis anhalten'
        : 'Sprachnachricht von Daniel Kontelis abspielen');
      figur.classList.toggle('sn--laeuft', laeuft);
    };

    knopf.addEventListener('click', () => {
      if (audio.paused) {
        for (const andere of alle) {
          const a = andere.querySelector<HTMLAudioElement>('[data-sn-audio]');
          if (a && a !== audio) a.pause();
        }
        void audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', () => zeige(true));
    audio.addEventListener('pause', () => zeige(false));
    audio.addEventListener('ended', () => { zeige(false); audio.currentTime = 0; zeichne(); });
    audio.addEventListener('timeupdate', zeichne);

    if (welle) {
      welle.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const kasten = welle.getBoundingClientRect();
        audio.currentTime = ((e.clientX - kasten.left) / kasten.width) * audio.duration;
        zeichne();
      });
    }
  }
}
