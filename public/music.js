/* Hey Trip: original theme music. No external APIs; no changes to app.js. */
(() => {
  'use strict';
  const tracks = {
    ocean: ['Biển xanh', '/assets/ocean.wav'],
    mountain: ['Núi rừng', '/assets/mountain.wav'],
    oldtown: ['Phố cổ', '/assets/oldtown.wav'],
    snow: ['Núi tuyết', '/assets/snow.wav']
  };
  function init() {
    const cssTheme = document.documentElement.style.getPropertyValue('--travel-image');
    const match = cssTheme.match(/\/(ocean|mountain|oldtown|snow)\.svg/);
    const id = match ? match[1] : 'ocean';
    const [label, url] = tracks[id];
    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = 'none';
    let storedVolume = 0.30;
    try { const saved = Number(localStorage.getItem('heytrip-music-volume')); if (Number.isFinite(saved) && saved >= 0 && saved <= 1) storedVolume = saved; } catch (_) {}
    audio.volume = storedVolume;
    const style = document.createElement('style');
    style.textContent = `
      .ht-music{position:fixed;right:18px;bottom:18px;z-index:9999;display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:18px;background:rgba(255,255,255,.94);box-shadow:0 6px 28px rgba(20,45,55,.22);color:#23414a;font:14px system-ui,sans-serif;max-width:calc(100vw - 36px);backdrop-filter:blur(12px)}
      .ht-music button{border:0;border-radius:999px;padding:9px 12px;background:#236c73;color:white;cursor:pointer;font:inherit;white-space:nowrap}
      .ht-music button:focus-visible,.ht-music input:focus-visible{outline:3px solid #2b9eb0;outline-offset:2px}
      .ht-music small{display:block;font-size:11px;opacity:.72;white-space:nowrap}
      .ht-music input{width:75px;accent-color:#236c73;cursor:pointer}
      @media(max-width:440px){.ht-music{right:10px;bottom:10px;gap:7px;padding:9px}.ht-music input{width:55px}.ht-music small{font-size:10px}}
    `;
    document.head.appendChild(style);
    const box = document.createElement('div');
    box.className = 'ht-music';
    box.innerHTML = '<div><strong>🎹 Nhạc nền</strong><small></small></div><button type="button" aria-label="Bật nhạc nền" aria-pressed="false">▶ Bật</button><input type="range" min="0" max="100" step="5" aria-label="Âm lượng nhạc nền">';
    const button = box.querySelector('button');
    const slider = box.querySelector('input');
    box.querySelector('small').textContent = label;
    slider.value = String(Math.round(audio.volume * 100));
    const sync = () => {
      const playing = !audio.paused;
      button.textContent = playing ? '⏸ Tắt' : '▶ Bật';
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? 'Tắt nhạc nền' : 'Bật nhạc nền');
    };
    button.addEventListener('click', async () => {
      if (!audio.paused) { audio.pause(); sync(); return; }
      try { await audio.play(); }
      catch (err) { console.warn('Không phát được nhạc:', err); alert('Chưa phát được nhạc. Hãy kiểm tra 4 file WAV trong public/assets.'); }
      sync();
    });
    slider.addEventListener('input', () => {
      audio.volume = Number(slider.value) / 100;
      try { localStorage.setItem('heytrip-music-volume', String(audio.volume)); } catch (_) {}
    });
    audio.addEventListener('pause', sync);
    audio.addEventListener('play', sync);
    audio.addEventListener('error', () => console.warn('Không tải được:', url));
    document.body.appendChild(box);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
