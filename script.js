// init
requestAnimationFrame(() => {
  ['heb', 'ht', 'hs', 'ha'].forEach(c => document.querySelector('.' + c)?.classList.add('v'));
  setTimeout(() => document.getElementById('hv')?.classList.add('v'), 300);
});

// scroll bar + nav state
// NOTE: throttled with requestAnimationFrame and passive:true to avoid
// jank / memory pressure on mobile Safari. The previous version fired
// on every scroll event and forced layout (reading scrollHeight + innerHeight),
// which was a contributor to the "A problem repeatedly occurred" crash on iOS.
const _sb = document.getElementById('scroll-bar');
const _bt = document.getElementById('back-top');
const _nav = document.getElementById('nav');
let _ticking = false;
let _docH = 0;
function _recalcDocH() { _docH = document.body.scrollHeight - innerHeight; }
_recalcDocH();
window.addEventListener('resize', _recalcDocH, { passive: true });
window.addEventListener('load', _recalcDocH, { passive: true });

window.addEventListener('scroll', () => {
  if (_ticking) return;
  _ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const pct = _docH > 0 ? (y / _docH) * 100 : 0;
    if (_sb) _sb.style.width = Math.min(pct, 100) + '%';
    if (_bt) _bt.classList.toggle('visible', y > 400);
    if (_nav) _nav.classList.toggle('scrolled', y > 40);
    _ticking = false;
  });
}, { passive: true });

// reveal-on-scroll
const ro = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }), { threshold: .1 });
document.querySelectorAll('.rv,.rvl,.rvr').forEach(el => ro.observe(el));

// tilt
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    card.style.transform = `perspective(900px) rotateX(${-(y / r.height) * 8}deg) rotateY(${(x / r.width) * 8}deg) translateY(-8px)`;
    card.style.boxShadow = `${-(x / r.width) * 14}px ${-(y / r.height) * 14}px 44px rgba(255,92,0,.12)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });
});

// service modals
document.querySelectorAll('.sc').forEach(card => {
  card.addEventListener('click', () => {
    const key = card.dataset.svc;
    document.getElementById('modal-' + key).classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});
function closeModal(key) {
  const modal = document.getElementById('modal-' + key);
  modal.classList.remove('open');
  document.body.style.overflow = '';
  modal.querySelectorAll('video').forEach(v => { v.pause(); });
  modal.querySelectorAll('iframe').forEach(f => { f.src = f.src; });
}
// industries accordion
function toggleAcc(header) {
  const item = header.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.acc-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) {
    item.classList.add('open');
    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }
}

// team modals
function openTeamModal(id) {
  document.getElementById('tm-' + id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeTeamModal(id) {
  document.getElementById('tm-' + id).classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-bg.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
      m.querySelectorAll('video').forEach(v => { v.pause(); });
      m.querySelectorAll('iframe').forEach(f => { f.src = f.src; });
    });
    document.querySelectorAll('.tm-bg.open').forEach(m => { m.classList.remove('open'); document.body.style.overflow = ''; });
  }
});

// contact form
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = document.getElementById('fsubmit');
  const ok = document.getElementById('fok');
  const err = document.getElementById('ferr');

  btn.textContent = 'Sending…';
  btn.disabled = true;
  ok.style.display = 'none';
  err.style.display = 'none';

  const data = new FormData(this);

  try {
    const res = await fetch('https://formsubmit.co/ajax/connect@quantumsync.com.au', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    });
    const json = await res.json();
    if (json.success === 'true' || json.success === true) {
      ok.style.display = 'block';
      this.reset();
      setTimeout(() => ok.style.display = 'none', 6000);
    } else {
      err.style.display = 'block';
    }
  } catch (e) {
    err.style.display = 'block';
  } finally {
    btn.textContent = 'Send Message →';
    btn.disabled = false;
  }
});
