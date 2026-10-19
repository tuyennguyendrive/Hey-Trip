/* Dynamic Travel Theme: random per page load; no API, no user data changes. */
(() => {
  const themes = [
    {id:'ocean',name:'Biển xanh',accent:'#078b93',soft:'#e0f7f1',dark:'#15576b'},
    {id:'mountain',name:'Núi rừng',accent:'#347d70',soft:'#e2f2e6',dark:'#244e49'},
    {id:'oldtown',name:'Phố cổ',accent:'#a05c67',soft:'#fae8de',dark:'#683f55'},
    {id:'snow',name:'Núi tuyết',accent:'#527fa8',soft:'#e3effa',dark:'#304d75'}
  ];
  // Avoid showing the same theme twice in a row where possible.
  let previous;
  try { previous = sessionStorage.getItem('heytrip-previous-theme'); } catch (_) {}
  const candidates = themes.filter(t => t.id !== previous);
  const theme = candidates[Math.floor(Math.random() * candidates.length)];
  try { sessionStorage.setItem('heytrip-previous-theme',theme.id); } catch (_) {}
  const root = document.documentElement;
  root.style.setProperty('--travel-image',`url("/assets/${theme.id}.svg")`);
  root.style.setProperty('--travel-accent',theme.accent);
  root.style.setProperty('--travel-soft',theme.soft);
  root.style.setProperty('--travel-dark',theme.dark);
  document.addEventListener('DOMContentLoaded', () => {
    const tag = document.querySelector('.tag');
    if(tag) tag.textContent = `✦ ${theme.name} · Mỗi lần ghé thăm, một hành trình mới`;
  });
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !window.matchMedia?.('(pointer:fine)').matches) return;
  let frame = 0;
  window.addEventListener('pointermove', (event) => {
    if(frame) return;
    const x = ((event.clientX / window.innerWidth) - .5) * -20;
    const y = ((event.clientY / window.innerHeight) - .5) * -16;
    frame = requestAnimationFrame(() => {
      root.style.setProperty('--scene-x',`${x.toFixed(1)}px`);
      root.style.setProperty('--scene-y',`${y.toFixed(1)}px`);
      frame = 0;
    });
  }, {passive:true});
})();
