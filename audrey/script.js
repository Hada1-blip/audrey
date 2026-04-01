'use strict';
/* ============================================================
   AUDREY CONCIERGERIE — script.js
   Animations · Carousel · Compteurs · Popup · Cookies
   ============================================================ */

/* ── NAV scroll ── */
const NAV = document.getElementById('NAV');
if(NAV){
  window.addEventListener('scroll', () => {
    NAV.classList.toggle('scrolled', window.scrollY > 60);
    NAV.classList.toggle('top', window.scrollY <= 60);
  });
  // init
  NAV.classList.toggle('scrolled', window.scrollY > 60);
  NAV.classList.toggle('top', window.scrollY <= 60);
}

/* ── Mobile menu ── */
const MOB = document.getElementById('MOB');
function openMob(){ if(MOB) MOB.classList.add('open'); }
function closeMob(){ if(MOB) MOB.classList.remove('open'); }

/* ── Reveal animations ── */
function initReveal(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.rv,.rv-l,.rv-r,.rv-s').forEach(el => {
    if(!el.classList.contains('in')) obs.observe(el);
  });
}

/* ── Compteurs animés ── */
function animateCounter(el){
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();
  function run(now){
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = Math.round(ease * target);
    el.textContent = val.toLocaleString('fr-FR') + suffix;
    if(p < 1) requestAnimationFrame(run);
  }
  requestAnimationFrame(run);
}
function initCounters(){
  const done = new Set();
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting && !done.has(e.target)){
        done.add(e.target);
        animateCounter(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .4 });
  document.querySelectorAll('[data-target]').forEach(el => obs.observe(el));
}

/* ── Barres de revenus animées ── */
function initRevenueBars(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.querySelectorAll('.rev-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.width || '0%';
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .3 });
  document.querySelectorAll('.revenue-bars').forEach(el => obs.observe(el));
}

/* ── Carousel ── */
function initCarousel(){
  const track = document.getElementById('DIFF_TRACK');
  if(!track) return;
  const cards = Array.from(track.querySelectorAll('.diff-card'));
  const dotsWrap = document.getElementById('DIFF_DOTS');
  const progFill = document.getElementById('DIFF_PROG');
  let idx = 0, isDrag = false, dragX = 0, dragSL = 0, autoTimer = null;

  // Crée les dots
  cards.forEach((_,i) => {
    const d = document.createElement('div');
    d.className = 'diff-dot' + (i===0 ? ' on' : '');
    d.addEventListener('click', () => { goTo(i); resetAuto(); });
    if(dotsWrap) dotsWrap.appendChild(d);
  });

  function goTo(i){
    idx = ((i % cards.length) + cards.length) % cards.length;
    const tr = track.getBoundingClientRect();
    const cr = cards[idx].getBoundingClientRect();
    const off = track.scrollLeft + (cr.left - tr.left) - (tr.width/2 - cr.width/2);
    track.scrollTo({ left: off, behavior: 'smooth' });
    update();
  }

  function update(){
    const cx = track.getBoundingClientRect().left + track.getBoundingClientRect().width/2;
    let best = 0, bd = Infinity;
    cards.forEach((c,i) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(r.left + r.width/2 - cx);
      if(d < bd){ bd = d; best = i; }
    });
    idx = best;
    cards.forEach((c,i) => c.classList.toggle('act', i===best));
    if(dotsWrap) dotsWrap.querySelectorAll('.diff-dot').forEach((d,i) => d.classList.toggle('on', i===best));
    if(progFill){ const p = 14 + (best/(cards.length-1))*86; progFill.style.width = p+'%'; }
  }

  function startAuto(){ autoTimer = setInterval(() => goTo(idx+1), 3800); }
  function resetAuto(){ clearInterval(autoTimer); startAuto(); }

  track.addEventListener('scroll', () => requestAnimationFrame(update));
  track.addEventListener('mousedown', e => { isDrag=true; dragX=e.pageX-track.offsetLeft; dragSL=track.scrollLeft; track.style.cursor='grabbing'; clearInterval(autoTimer); });
  track.addEventListener('mousemove', e => { if(!isDrag) return; e.preventDefault(); track.scrollLeft = dragSL - (e.pageX - track.offsetLeft - dragX)*1.3; });
  ['mouseup','mouseleave'].forEach(ev => track.addEventListener(ev, () => { if(isDrag){ isDrag=false; track.style.cursor='grab'; setTimeout(()=>{ update(); resetAuto(); }, 150); } }));
  track.addEventListener('touchstart', () => clearInterval(autoTimer), { passive: true });
  track.addEventListener('touchend', () => setTimeout(()=>{ update(); resetAuto(); }, 200));

  const prevBtn = document.getElementById('DIFF_PREV');
  const nextBtn = document.getElementById('DIFF_NEXT');
  if(prevBtn) prevBtn.addEventListener('click', () => { goTo(idx-1); resetAuto(); });
  if(nextBtn) nextBtn.addEventListener('click', () => { goTo(idx+1); resetAuto(); });

  setTimeout(() => { cards[0].classList.add('act'); startAuto(); }, 300);
}

/* ── Popup devis ── */
function initPopup(){
  const box = document.getElementById('POPUP');
  const ov  = document.getElementById('POPUP_OV');
  if(!box) return;
  let shown = false;
  setTimeout(() => {
    if(!shown && !sessionStorage.getItem('popup_dismissed')){
      box.classList.add('open');
      shown = true;
    }
  }, 6000);
  function close(){
    box.classList.remove('open');
    if(ov) ov.classList.remove('open');
    sessionStorage.setItem('popup_dismissed','1');
  }
  const closeBtn = document.getElementById('POPUP_CLOSE');
  const dismissEl = document.getElementById('POPUP_DISMISS');
  if(closeBtn) closeBtn.addEventListener('click', close);
  if(dismissEl) dismissEl.addEventListener('click', close);
  if(ov) ov.addEventListener('click', close);
}

/* ── Cookies ── */
function initCookies(){
  const bar = document.getElementById('COOKIE');
  if(!bar) return;
  if(localStorage.getItem('cookies_ok')) return;
  setTimeout(() => bar.classList.add('show'), 1500);
  function accept(){
    localStorage.setItem('cookies_ok','1');
    bar.classList.remove('show');
  }
  const acc = document.getElementById('COOKIE_ACCEPT');
  const ref = document.getElementById('COOKIE_REFUSE');
  if(acc) acc.addEventListener('click', accept);
  if(ref) ref.addEventListener('click', () => bar.classList.remove('show'));
}

/* ── Formulaires ── */
function initForms(){
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.form-submit');
      const success = form.querySelector('.form-success');
      if(btn){ btn.innerHTML='<span>Envoi en cours…</span>'; btn.disabled = true; }
      setTimeout(() => {
        if(btn) btn.style.display = 'none';
        if(success) success.style.display = 'block';
      }, 1200);
    });
  });
}

/* ── Init ── */
window.addEventListener('load', () => {
  initReveal();
  initCounters();
  initRevenueBars();
  initCarousel();
  initPopup();
  initCookies();
  initForms();
});
