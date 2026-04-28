/* ===== THREE.JS BACKGROUND ===== */
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.z = 60;

  /* --- Particle field --- */
  const PARTICLE_COUNT = 1800;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const palette = [
    new THREE.Color('#3b82f6'),
    new THREE.Color('#a855f7'),
    new THREE.Color('#2dd4bf'),
    new THREE.Color('#60a5fa'),
    new THREE.Color('#c084fc'),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 30 + Math.random() * 60;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i] = Math.random() * 1.8 + 0.4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      void main() {
        vColor = color;
        vec3 pos = position;
        float wave = sin(uTime * 0.3 + pos.x * 0.05 + pos.y * 0.04) * 0.8;
        pos.y += wave;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPos.z);
        vAlpha = smoothstep(0.0, 1.0, (90.0 + mvPos.z) / 60.0) * 0.7;
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
        float alpha = (1.0 - d * 4.0) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* --- Floating torus rings --- */
  function addRing(rx, ry, rz, col, opacity) {
    const g = new THREE.TorusGeometry(12 + Math.random() * 8, 0.06, 8, 120);
    const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.set(rx, ry, rz);
    mesh.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10 - 20);
    scene.add(mesh);
    return mesh;
  }

  const rings = [
    addRing(0.4, 0.2, 0, 0x3b82f6, 0.12),
    addRing(1.1, 0.5, 0.3, 0xa855f7, 0.10),
    addRing(0.8, 1.2, 0.6, 0x2dd4bf, 0.08),
  ];

  /* --- Mouse parallax --- */
  const mouse = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
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

    target.x += (mouse.x - target.x) * 0.04;
    target.y += (mouse.y - target.y) * 0.04;

    particles.rotation.y = t * 0.025 + target.x * 0.3;
    particles.rotation.x = t * 0.015 + target.y * 0.2;

    rings.forEach((r, i) => {
      r.rotation.z += 0.0008 * (i + 1);
      r.rotation.x += 0.0005 * (i + 1);
    });

    renderer.render(scene, camera);
  }
  animate();
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
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

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
          l.style.color = l.getAttribute('href') === `#${id}` ? '#f0f0f5' : '';
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
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
  });
});
