import { H as Hls } from './video-player-dru42stk.js';

function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
}

function initMobileNav() {
  const btn = document.querySelector('[data-mobile-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (!btn || !panel) return;
  btn.addEventListener('click', () => panel.classList.toggle('open'));
}

function initFloatingTop() {
  const el = document.querySelector('[data-float-top]');
  if (!el) return;
  const onScroll = () => el.classList.toggle('show', window.scrollY > 500);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  el.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initFilters() {
  const forms = [...document.querySelectorAll('[data-search-form]')];
  const inputs = [...document.querySelectorAll('[data-search-input]')];
  const cards = [...document.querySelectorAll('[data-card]')];
  const chips = [...document.querySelectorAll('[data-filter-chip]')];
  const count = document.querySelector('[data-filter-count]');
  if (!cards.length) return;

  let activeCategory = 'all';
  const refresh = () => {
    const q = (inputs[0]?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const hay = (card.dataset.keywords || '').toLowerCase();
      const cat = card.dataset.category || 'all';
      const matchQ = !q || hay.includes(q);
      const matchC = activeCategory === 'all' || activeCategory === cat;
      const show = matchQ && matchC;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    if (count) count.textContent = `当前显示 ${visible} / ${cards.length} 部影片`;
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      activeCategory = chip.dataset.filterChip || 'all';
      chips.forEach(x => x.classList.toggle('active', x === chip));
      refresh();
    });
  });

  inputs.forEach(input => input.addEventListener('input', () => {
    const value = input.value;
    inputs.forEach(other => { if (other !== input) other.value = value; });
    refresh();
  }));
  forms.forEach(form => form.addEventListener('submit', e => e.preventDefault()));
  refresh();
}

function initHeroScroll() {
  const track = document.querySelector('[data-hero-track]');
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  if (!track) return;
  const step = () => Math.max(260, Math.floor(track.clientWidth * 0.78));
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  let timer = null;
  const auto = () => {
    clearInterval(timer);
    timer = setInterval(() => {
      const max = track.scrollWidth - track.clientWidth - 4;
      const atEnd = track.scrollLeft >= max;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + 1.1 * step(), behavior: 'smooth' });
    }, 5500);
  };
  auto();
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', auto);
}

function initPosters() {
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    const fallback = img.closest('[data-poster-wrap]')?.querySelector('[data-poster-fallback]');
    img.addEventListener('error', () => {
      img.style.display = 'none';
      if (fallback) fallback.style.display = 'flex';
    });
  });
}

function initPlayer() {
  const video = document.querySelector('[data-player-video]');
  if (!video) return;
  const overlay = document.querySelector('[data-player-overlay]');
  const playBtn = document.querySelector('[data-player-play]');
  const title = document.querySelector('[data-player-title]');
  const hlsUrl = video.dataset.hls;
  const mp4Url = video.dataset.mp4;
  let hls = null;

  const showOverlay = (show) => {
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
  };

  const bind = (src) => {
    video.src = src;
    video.load();
  };

  if (hlsUrl && Hls.isSupported()) {
    hls = new Hls({
      lowLatencyMode: false,
      enableWorker: true,
      debug: false,
    });
    hls.loadSource(hlsUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (title) title.textContent = `${title.textContent} · HLS 已就绪`;
    });
    hls.on(Hls.Events.ERROR, (_evt, data) => {
      if (data && data.fatal && mp4Url) {
        bind(mp4Url);
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl') && hlsUrl) {
    bind(hlsUrl);
  } else if (mp4Url) {
    bind(mp4Url);
  }

  playBtn?.addEventListener('click', async () => {
    try {
      await video.play();
      showOverlay(false);
    } catch (err) {
      console.warn(err);
    }
  });

  video.addEventListener('play', () => showOverlay(false));
  video.addEventListener('pause', () => showOverlay(true));
  video.addEventListener('ended', () => showOverlay(true));
  showOverlay(true);
}

ready(() => {
  initMobileNav();
  initFloatingTop();
  initFilters();
  initHeroScroll();
  initPosters();
  initPlayer();
});
