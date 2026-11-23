// Kaspar website — shared front-end behaviour
document.addEventListener('DOMContentLoaded', function () {
  var links = document.querySelectorAll('.nav-links a');
  var menu = document.querySelector('.nav-links');
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
      }
    });
  });

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Animated counters
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.stat-num[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }

  // Hero ambient flow canvas
  var canvas = document.querySelector('.hero-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var W = 0, H = 0, parts = [];
    var mouse = { x: null, y: null };

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn() {
      return {
        x: Math.random() * W,
        baseY: Math.random() * H,
        y: 0,
        speed: 0.15 + Math.random() * 0.35,
        size: 1 + Math.random() * 2.2,
        alpha: 0.12 + Math.random() * 0.32,
        phase: Math.random() * Math.PI * 2,
        amp: 8 + Math.random() * 18,
        yellow: Math.random() > 0.35
      };
    }
    function initParts() {
      parts = [];
      for (var i = 0; i < 36; i++) parts.push(spawn());
    }
    resize();
    initParts();
    window.addEventListener('resize', function () { resize(); });

    var hero = canvas.parentElement;
    hero.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('mouseleave', function () { mouse.x = null; mouse.y = null; });

    function frame(t) {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.x += p.speed;
        if (p.x > W + 10) { p.x = -10; p.baseY = Math.random() * H; }
        p.y = p.baseY + Math.sin(t / 1400 + p.phase) * p.amp;
        var a = p.alpha;
        if (mouse.x !== null) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) a = Math.min(0.8, a + (1 - d / 120) * 0.3);
        }
        var col = p.yellow ? '255,180,0' : '217,219,221';
        ctx.strokeStyle = 'rgba(' + col + ',' + (a * 0.5) + ')';
        ctx.lineWidth = p.size * 0.7;
        ctx.beginPath();
        ctx.moveTo(p.x - p.speed * 10, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(' + col + ',' + a + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    if (!reduced) requestAnimationFrame(frame);
  }

  // ===== Horizontal product rail (desktop sticky pin) =====
  var hSection = document.querySelector('.h-section');
  if (hSection) {
    var viewport = hSection.querySelector('.h-viewport');
    var track = hSection.querySelector('.h-track');
    var counter = hSection.querySelector('.h-counter');
    var fill = hSection.querySelector('.h-progress span');
    var hReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hOverflow = 0, hTop = 0;
    var hTotal = track ? track.children.length : 0;

    function hMeasure() {
      if (hReduce || window.innerWidth <= 960) {
        hSection.style.height = 'auto';
        track.style.transform = 'none';
        return;
      }
      hTop = hSection.getBoundingClientRect().top + window.scrollY;
      hOverflow = Math.max(0, track.scrollWidth - viewport.clientWidth);
      hSection.style.height = (window.innerHeight + hOverflow) + 'px';
    }
    function hOnScroll() {
      if (hReduce || window.innerWidth <= 960 || hOverflow <= 0) return;
      var max = hSection.offsetHeight - window.innerHeight;
      var p = Math.min(Math.max((window.scrollY - hTop) / max, 0), 1);
      track.style.transform = 'translateX(' + (-p * hOverflow) + 'px)';
      if (fill) fill.style.transform = 'scaleX(' + p + ')';
      if (counter && hTotal) {
        var idx = Math.min(Math.floor(p * hTotal), hTotal - 1) + 1;
        counter.textContent = (idx < 10 ? '0' : '') + idx + ' / ' + (hTotal < 10 ? '0' : '') + hTotal;
      }
    }
    hMeasure(); hOnScroll();
    window.addEventListener('resize', hMeasure);
    window.addEventListener('load', hMeasure);
    window.addEventListener('scroll', hOnScroll, { passive: true });
  }

  // ===== Section spy: highlight the matching nav link on the homepage =====
  var spyMap = [
    { sel: '#hero', link: '.nav-links a[href="index.html"]' },
    { sel: '#products', link: '.nav-links a[href="products.html"]' },
    { sel: '#categories', link: '.nav-links a[href="products.html"]' },
    { sel: '#about-teaser', link: '.nav-links a[href="about.html"]' },
    { sel: '#cta-band', link: '.nav-links a[href="contact.html"]' }
  ];
  var spyPairs = spyMap.map(function (m) {
    var sec = document.querySelector(m.sel);
    var link = document.querySelector(m.link);
    return (sec && link) ? { sec: sec, link: link } : null;
  }).filter(Boolean);

  function spyActivate(link) {
    spyPairs.forEach(function (p) { p.link.classList.toggle('active', p.link === link); });
  }
  if ('IntersectionObserver' in window && spyPairs.length) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var pair = spyPairs.find(function (p) { return p.sec === entry.target; });
          if (pair) spyActivate(pair.link);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    spyPairs.forEach(function (p) { spyIO.observe(p.sec); });
  }
});
