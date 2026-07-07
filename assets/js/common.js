/* THE PHOENIX — 全站共用 JS
   由各頁內嵌 <script> 合併而成（2026-07-08） */

/* ===== 全站共用：手機版漢堡選單開關（RWD, 2026-07-08） ===== */
(function () {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('header-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ===== INDEX: Hero 圖片 scroll parallax ===== */
(function () {
  const heroImg = document.getElementById('hero-img');
  if (!heroImg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroImg.style.transform = `scale(1) translateY(${y * 0.25}px)`;
  }, { passive: true });
})();

/* ===== INDEX: Service 縮圖 hover 放大效果 ===== */
(function () {
  const photos = document.querySelectorAll('.service-photo');
  photos.forEach(photo => {
    photo.addEventListener('mouseenter', () => {
      photos.forEach(p => {
        p.style.flexBasis = p === photo ? '24vw' : '19vw';
      });
    });
    photo.addEventListener('mouseleave', () => {
      photos.forEach(p => {
        p.style.flexBasis = '20vw';
      });
    });
  });
})();

/* ===== SERVICE: 側邊導覽點擊捲動 + scroll 高亮 ===== */
(function () {
  const navItems = document.querySelectorAll('.service-nav-item');
  const items = document.querySelectorAll('.service-item');
  if (!navItems.length || !items.length) return;

  navItems.forEach(nav => {
    nav.style.cursor = 'pointer';
    nav.addEventListener('click', () => {
      const target = document.getElementById(nav.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navItems.forEach(n => {
          n.classList.toggle('active', n.dataset.target === id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  items.forEach(item => observer.observe(item));
})();

/* ===== WORKS: 跑馬燈捲動 + 控制列 ===== */
(function () {
  document.querySelectorAll('.works-section').forEach(section => {
    const wrap = section.querySelector('.works-marquee-wrap');
    const track = section.querySelector('.works-marquee-track');
    const controlEl = section.querySelector('.works-control');
    const captionEl = section.querySelector('.works-control-caption');
    const countEl = section.querySelector('.works-control-count');
    const prevBtn = section.querySelector('.works-prev-btn');
    const nextBtn = section.querySelector('.works-next-btn');
    if (!wrap || !track) return;
    const photos = Array.from(track.querySelectorAll('.works-photo'));
    const total = photos.length / 2;

    let offset = 0;
    let lastTime = null;
    let hovering = false;
    let manualPauseUntil = 0;
    let lastCheck = 0;
    let lastIndex = -1;

    function pad(n) { return String(n).padStart(2, '0'); }

    function findClosest() {
      const wrapRect = wrap.getBoundingClientRect();
      const centerX = wrapRect.left + wrapRect.width / 2;
      let closest = photos[0];
      let closestDist = Infinity;
      photos.forEach(p => {
        const r = p.getBoundingClientRect();
        const d = Math.abs((r.left + r.width / 2) - centerX);
        if (d < closestDist) { closestDist = d; closest = p; }
      });
      return closest;
    }

    function updateCaption(now) {
      if (now - lastCheck < 150) return;
      lastCheck = now;
      const closest = findClosest();
      const idx = photos.indexOf(closest) % total;
      if (idx !== lastIndex) {
        lastIndex = idx;
        if (captionEl) captionEl.textContent = closest.dataset.title || '';
        if (countEl) countEl.textContent = `${pad(idx + 1)} / ${pad(total)}`;
      }
    }

    function tick(t) {
      if (lastTime !== null) {
        const isPaused = hovering || t < manualPauseUntil;
        if (!isPaused) {
          const half = track.scrollWidth / 2;
          offset += (t - lastTime) * (half / 120000);
          if (offset >= half) offset -= half;
        }
      }
      lastTime = t;
      track.style.transform = `translateX(${-offset}px)`;
      updateCaption(t);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    [wrap, controlEl].forEach(el => {
      if (!el) return;
      el.addEventListener('mouseenter', () => { hovering = true; });
      el.addEventListener('mouseleave', () => { hovering = false; });
    });

    function step(dir) {
      const currentEl = findClosest();
      const currentIdxInDom = photos.indexOf(currentEl);
      let targetIdxInDom = currentIdxInDom + dir;
      if (targetIdxInDom < 0) targetIdxInDom = photos.length - 1;
      if (targetIdxInDom >= photos.length) targetIdxInDom = 0;

      const currentRect = currentEl.getBoundingClientRect();
      const targetRect = photos[targetIdxInDom].getBoundingClientRect();
      const delta = (targetRect.left + targetRect.width / 2) - (currentRect.left + currentRect.width / 2);

      const startOffset = offset;
      const duration = 500;
      const startTime = performance.now();
      manualPauseUntil = startTime + duration + 2000;

      function animateStep(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const half = track.scrollWidth / 2;
        offset = ((startOffset + delta * eased) % half + half) % half;
        if (p < 1) requestAnimationFrame(animateStep);
      }
      requestAnimationFrame(animateStep);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => step(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => step(1));
  });
})();
