// tbd-mmo design wiki — theme switch, language switch and image lightbox.
// No build step and no dependencies; every page loads this file with `defer`.
(() => {
  const root = document.documentElement;
  const KEY = 'wiki-theme';
  const MODES = ['system', 'dark', 'light'];
  const STRINGS = {
    en: {
      system: 'Theme: system', dark: 'Theme: dark', light: 'Theme: light', switchTheme: 'Switch theme',
      image: 'Full-size image', download: 'Download', original: 'Open original', close: 'Close',
    },
    uk: {
      system: 'Тема: системна', dark: 'Тема: темна', light: 'Тема: світла', switchTheme: 'Змінити тему',
      image: 'Зображення в повному розмірі', download: 'Завантажити', original: 'Відкрити оригінал', close: 'Закрити',
    },
  };
  const t = STRINGS[root.lang] || STRINGS.en;
  const LABELS = { system: t.system, dark: t.dark, light: t.light };

  const readMode = () => {
    try { return localStorage.getItem(KEY) || 'system'; } catch { return 'system'; }
  };
  const applyMode = mode => {
    if (mode === 'system') delete root.dataset.theme;
    else root.dataset.theme = mode;
    try {
      if (mode === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch { /* storage blocked: the choice lasts for this page only */ }
    for (const button of document.querySelectorAll('.theme-toggle')) {
      button.textContent = LABELS[mode];
      button.setAttribute('aria-label', `${LABELS[mode]}. ${t.switchTheme}`);
    }
  };

  let mode = MODES.includes(readMode()) ? readMode() : 'system';
  applyMode(mode);
  for (const button of document.querySelectorAll('.theme-toggle')) {
    button.addEventListener('click', () => {
      mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
      applyMode(mode);
    });
  }

  // A translation keeps every id of its original, so switching language keeps the reader's place.
  for (const link of document.querySelectorAll('.lang-switch a')) {
    link.addEventListener('click', () => { if (location.hash) link.hash = location.hash; });
  }

  // On a phone the rail is one horizontal strip; bring the current section into view.
  const navList = document.querySelector('.rail nav > ol');
  const current = navList && [...navList.children].find(li => li.querySelector(':scope > a[aria-current]'));
  if (current && navList.scrollWidth > navList.clientWidth) {
    navList.scrollLeft = current.offsetLeft - (navList.clientWidth - current.offsetWidth) / 2;
  }

  // Lightbox: every <a class="zoom" href="full.webp"><img alt="…"></a> opens the
  // full-size image with a download link. Without JS the link still opens the file.
  const zooms = [...document.querySelectorAll('a.zoom')];
  if (!zooms.length) return;

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', t.image);
  box.innerHTML = `
    <div class="lightbox-bar">
      <a class="lightbox-download" download>${t.download}</a>
      <a class="lightbox-open" target="_blank" rel="noopener">${t.original}</a>
      <button type="button" class="lightbox-close">${t.close} ✕</button>
    </div>
    <img alt="">
    <p></p>`;
  document.body.append(box);

  const img = box.querySelector('img');
  const caption = box.querySelector('p');
  const download = box.querySelector('.lightbox-download');
  const original = box.querySelector('.lightbox-open');
  const close = box.querySelector('.lightbox-close');
  let opener = null;

  const hide = () => {
    box.hidden = true;
    img.removeAttribute('src');
    document.body.style.overflow = '';
    if (opener) opener.focus();
  };

  for (const link of zooms) {
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      opener = link;
      const thumb = link.querySelector('img');
      const href = link.getAttribute('href');
      img.src = href;
      img.alt = thumb ? thumb.alt : '';
      const figcaption = link.closest('figure')?.querySelector('figcaption');
      if (figcaption) {
        const kind = figcaption.querySelector('.kind')?.textContent.trim();
        const text = [...figcaption.childNodes]
          .filter(node => !(node.classList && node.classList.contains('kind')))
          .map(node => node.textContent).join('').trim();
        caption.textContent = kind ? `${kind} · ${text}` : text;
      } else {
        caption.textContent = img.alt;
      }
      download.href = href;
      download.setAttribute('download', href.split('/').pop());
      original.href = href;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      close.focus();
    });
  }

  close.addEventListener('click', hide);
  box.addEventListener('click', event => { if (event.target === box || event.target === img) hide(); });
  document.addEventListener('keydown', event => {
    if (box.hidden) return;
    if (event.key === 'Escape') hide();
    if (event.key === 'Tab') {
      // Keep focus inside the dialog.
      const items = [download, original, close];
      const i = items.indexOf(document.activeElement);
      event.preventDefault();
      items[(i + (event.shiftKey ? items.length - 1 : 1)) % items.length].focus();
    }
  });
})();
