/* ===== LOADER ===== */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 900);
  });
})();

/* ===== CUSTOM CURSOR ===== */
(function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let raf;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

  const interactables = 'a, button, .project-card, .stat-card, .skill-group, .timeline-card, input, textarea';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactables)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactables)) document.body.classList.remove('cursor-hover');
  });

  function loop() {
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    raf = requestAnimationFrame(loop);
  }
  loop();
})();

/* ===== THREE.JS BACKGROUND ===== */
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 300);
  camera.position.z = 70;

  /* --- Particle field --- */
  const PARTICLE_COUNT = 2200;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const palette = [
    new THREE.Color('#3b82f6'),
    new THREE.Color('#a855f7'),
    new THREE.Color('#2dd4bf'),
    new THREE.Color('#60a5fa'),
    new THREE.Color('#c084fc'),
    new THREE.Color('#818cf8'),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 35 + Math.random() * 75;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i] = Math.random() * 2.2 + 0.4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0, 0) } },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      void main() {
        vColor = color;
        vec3 pos = position;
        float wave = sin(uTime * 0.25 + pos.x * 0.04 + pos.z * 0.03) * 1.2
                   + cos(uTime * 0.2  + pos.y * 0.05) * 0.6;
        pos.y += wave;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (350.0 / -mvPos.z);
        vAlpha = smoothstep(0.0, 1.0, (100.0 + mvPos.z) / 70.0) * 0.75;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = dot(uv, uv);
        if (d > 0.25) discard;
        float glow = exp(-d * 6.0);
        float alpha = glow * vAlpha;
        gl_FragColor = vec4(vColor + glow * 0.3, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* --- Floating wireframe icosahedra --- */
  const wireObjs = [];
  const wireColors = [0x3b82f6, 0xa855f7, 0x2dd4bf, 0x818cf8];

  function makeWireframe(size, col, x, y, z) {
    const g = new THREE.IcosahedronGeometry(size, 1);
    const m = new THREE.MeshBasicMaterial({
      color: col,
      wireframe: true,
      transparent: true,
      opacity: 0.08 + Math.random() * 0.07,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    mesh.userData.rotSpeed = {
      x: (Math.random() - 0.5) * 0.003,
      y: (Math.random() - 0.5) * 0.004,
    };
    mesh.userData.floatSpeed = 0.0006 + Math.random() * 0.0008;
    mesh.userData.floatAmp  = 3 + Math.random() * 4;
    mesh.userData.floatOff  = Math.random() * Math.PI * 2;
    scene.add(mesh);
    wireObjs.push(mesh);
  }

  makeWireframe(8,  wireColors[0],  28, -10, -30);
  makeWireframe(6,  wireColors[1], -30,  15, -25);
  makeWireframe(10, wireColors[2],  -8, -20, -40);
  makeWireframe(5,  wireColors[3],  18,  22, -20);
  makeWireframe(7,  wireColors[0], -22, -8,  -35);

  /* --- Torus rings --- */
  const rings = [];
  function addRing(rx, ry, rz, col, opacity, px, py, pz) {
    const g = new THREE.TorusGeometry(10 + Math.random() * 8, 0.05, 8, 120);
    const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.set(rx, ry, rz);
    mesh.position.set(px, py, pz);
    scene.add(mesh);
    rings.push(mesh);
    return mesh;
  }

  addRing(0.4, 0.2, 0,   0x3b82f6, 0.10,  12, -5, -15);
  addRing(1.1, 0.5, 0.3, 0xa855f7, 0.08, -14,  8, -20);
  addRing(0.8, 1.2, 0.6, 0x2dd4bf, 0.07,   3, 14, -25);

  /* --- Mouse + scroll parallax --- */
  const mouse = { x: 0, y: 0 };
  const mouseTarget = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* --- Resize --- */
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  onResize();
  window.addEventListener('resize', onResize);

  /* --- Animation loop --- */
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    mat.uniforms.uTime.value = t;

    mouseTarget.x += (mouse.x - mouseTarget.x) * 0.04;
    mouseTarget.y += (mouse.y - mouseTarget.y) * 0.04;

    const scrollFrac = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);

    particles.rotation.y = t * 0.018 + mouseTarget.x * 0.25;
    particles.rotation.x = t * 0.012 + mouseTarget.y * 0.18;

    camera.position.y = mouseTarget.y * 4 - scrollFrac * 30;
    camera.position.x = mouseTarget.x * 3;
    camera.lookAt(scene.position);

    rings.forEach((r, i) => {
      r.rotation.z += 0.0007 * (i + 1);
      r.rotation.x += 0.0004 * (i + 1);
    });

    wireObjs.forEach((w, i) => {
      w.rotation.x += w.userData.rotSpeed.x;
      w.rotation.y += w.userData.rotSpeed.y;
      w.position.y += Math.sin(t * w.userData.floatSpeed * 200 + w.userData.floatOff) * 0.01;
    });

    renderer.render(scene, camera);
  }
  animate();
})();

/* ===== TYPEWRITER ===== */
(function initTypewriter() {
  const el = document.getElementById('hero-role-text');
  if (!el) return;

  const phrases = [
    'ML Systems & Data Engineer',
    'PyTorch & Distributed Training',
    'Data Pipeline Builder',
    'MLOps Practitioner',
    'ML Evaluation Engineer',
  ];
  let pi = 0, ci = 0, deleting = false;
  const WAIT = 2200, TYPE_SPEED = 60, DEL_SPEED = 35;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ci + 1);
      ci++;
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(tick, WAIT);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? DEL_SPEED : TYPE_SPEED);
  }
  setTimeout(tick, 900);
})();

/* ===== CARD SPOTLIGHT (mouse-tracking radial gradient) ===== */
(function initSpotlight() {
  const cards = document.querySelectorAll('.project-card, .timeline-card, .stat-card, .skill-group');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', x);
      card.style.setProperty('--my', y);
    });
  });
})();

/* ===== NAVBAR ===== */
(function initNav() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!open));
    hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
      mobileMenu?.classList.remove('open');
    });
  });
})();

/* ===== SCROLL REVEAL ===== */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 70);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => io.observe(el));
})();

/* ===== ACTIVE NAV LINK ===== */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          const active = l.getAttribute('href') === `#${id}`;
          l.style.color = active ? '#f0f0f5' : '';
          l.style.background = active ? 'rgba(255,255,255,0.06)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ===== CONTACT FORM ===== */
(function initForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (status) {
      status.style.color = 'var(--green)';
      status.textContent = 'Thanks! Message noted — I\'ll be in touch soon.';
    }
    form.reset();
    setTimeout(() => { if (status) status.textContent = ''; }, 5000);
  });
})();

/* ===== SMOOTH NAV SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navH = 68;
    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
  });
});
