/* ═══════════════════════════════════════
   PRISM — Three.js Hero + Interactions
   ═══════════════════════════════════════ */

// ─── Three.js Hero Scene ───
const canvas = document.getElementById('heroCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 0.8, 5.5);

// Lights
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 8, 6);
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.3);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambLight);

const rimLight = new THREE.PointLight(0x06b6d4, 0.6, 20);
rimLight.position.set(-3, 3, -4);
scene.add(rimLight);

// ─── Floating Geometric Composition ───
const mainGroup = new THREE.Group();

// Materials
const matIndigo = new THREE.MeshStandardMaterial({
  color: 0x4f46e5, metalness: 0.7, roughness: 0.15
});
const matCyan = new THREE.MeshStandardMaterial({
  color: 0x06b6d4, metalness: 0.6, roughness: 0.2
});
const matViolet = new THREE.MeshStandardMaterial({
  color: 0x8b5cf6, metalness: 0.5, roughness: 0.25
});
const matWhite = new THREE.MeshStandardMaterial({
  color: 0xffffff, metalness: 0.1, roughness: 0.4
});
const matGlass = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, metalness: 0.0, roughness: 0.05,
  transmission: 0.9, thickness: 0.5, ior: 1.5
});

// Central icosahedron (hero shape)
const icoGeo = new THREE.IcosahedronGeometry(0.9, 1);
const ico = new THREE.Mesh(icoGeo, matIndigo);
ico.position.set(0, 0.3, 0);
mainGroup.add(ico);

// Wireframe overlay on icosahedron
const wireGeo = new THREE.IcosahedronGeometry(0.92, 1);
const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.15 });
const wireIco = new THREE.Mesh(wireGeo, wireMat);
wireIco.position.copy(ico.position);
mainGroup.add(wireIco);

// Floating torus (ring)
const torusGeo = new THREE.TorusGeometry(1.4, 0.04, 16, 80);
const torus = new THREE.Mesh(torusGeo, matCyan);
torus.position.set(0, 0.3, 0);
torus.rotation.x = Math.PI / 3;
mainGroup.add(torus);

// Second torus
const torus2Geo = new THREE.TorusGeometry(1.6, 0.03, 16, 80);
const torus2 = new THREE.Mesh(torus2Geo, matViolet);
torus2.position.set(0, 0.3, 0);
torus2.rotation.x = -Math.PI / 4;
torus2.rotation.z = Math.PI / 6;
mainGroup.add(torus2);

// Small orbiting spheres
const smallSpheres = [];
const spherePositions = [
  { angle: 0, radius: 1.8, y: 0.6, mat: matCyan, size: 0.12 },
  { angle: Math.PI * 0.66, radius: 1.6, y: 0.1, mat: matViolet, size: 0.1 },
  { angle: Math.PI * 1.33, radius: 2.0, y: 0.9, mat: matIndigo, size: 0.14 },
  { angle: Math.PI * 0.5, radius: 1.4, y: -0.2, mat: matWhite, size: 0.08 },
  { angle: Math.PI * 1.1, radius: 2.2, y: 0.4, mat: matCyan, size: 0.09 },
];

spherePositions.forEach(sp => {
  const geo = new THREE.SphereGeometry(Math.max(0.01, sp.size), 24, 24);
  const mesh = new THREE.Mesh(geo, sp.mat);
  mesh.userData = { angle: sp.angle, radius: sp.radius, baseY: sp.y, speed: 0.3 + Math.random() * 0.4 };
  mainGroup.add(mesh);
  smallSpheres.push(mesh);
});

// Glass octahedron
const octGeo = new THREE.OctahedronGeometry(0.35, 0);
const oct = new THREE.Mesh(octGeo, matGlass);
oct.position.set(1.5, 1.2, -0.5);
oct.userData = { floatSpeed: 0.7, floatAmp: 0.15 };
mainGroup.add(oct);

// Small cube
const cubeGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
const cube = new THREE.Mesh(cubeGeo, matViolet);
cube.position.set(-1.3, 1.0, 0.3);
cube.userData = { floatSpeed: 0.5, floatAmp: 0.12 };
mainGroup.add(cube);

scene.add(mainGroup);

// ─── Particle field ───
const particleCount = 120;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0x4f46e5, size: 0.03, transparent: true, opacity: 0.4
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ─── Mouse interaction ───
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ─── Resize ───
function resize() {
  const w = canvas.clientWidth || canvas.parentElement.clientWidth;
  const h = canvas.clientHeight || 440;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// ─── Animation Loop ───
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Central icosahedron rotation
  ico.rotation.x = t * 0.15;
  ico.rotation.y = t * 0.2;
  wireIco.rotation.copy(ico.rotation);

  // Torus rotations
  torus.rotation.z = t * 0.3;
  torus2.rotation.y = t * 0.25;

  // Orbiting spheres
  smallSpheres.forEach(s => {
    const d = s.userData;
    const angle = d.angle + t * d.speed;
    s.position.x = Math.cos(angle) * d.radius;
    s.position.z = Math.sin(angle) * d.radius;
    s.position.y = d.baseY + Math.sin(t * 1.5 + d.angle) * 0.15;
  });

  // Floating shapes
  oct.rotation.x = t * 0.4;
  oct.rotation.y = t * 0.3;
  oct.position.y = 1.2 + Math.sin(t * oct.userData.floatSpeed) * oct.userData.floatAmp;

  cube.rotation.x = t * 0.5;
  cube.rotation.z = t * 0.3;
  cube.position.y = 1.0 + Math.sin(t * cube.userData.floatSpeed + 1) * cube.userData.floatAmp;

  // Gentle group sway from mouse
  mainGroup.rotation.y += (mouseX * 0.15 - mainGroup.rotation.y) * 0.03;
  mainGroup.rotation.x += (-mouseY * 0.08 - mainGroup.rotation.x) * 0.03;

  // Particles drift
  particles.rotation.y = t * 0.02;
  particles.rotation.x = t * 0.01;

  renderer.render(scene, camera);
}

window.addEventListener('resize', resize);
resize();
animate();

// ─── Scroll Reveal ───
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// ─── Modal / Contact ───
const modal = document.getElementById('contactModal');
const modalClose = document.getElementById('modalClose');
const form = document.getElementById('contactForm');

function openModal() {
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// All contact buttons open the modal
document.querySelectorAll('#contactBtn, #contactBtn2, #contactBtn3, #contactBtn4').forEach(btn => {
  btn.addEventListener('click', openModal);
});
modalClose.addEventListener('click', closeModal);
modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
});

// Form submit with animation
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('.send-btn');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');
  const msgEl = document.getElementById('formMsg');

  // Client-side validation: email and phone
  const email = (emailEl.value || '').trim();
  const phone = (phoneEl.value || '').trim();
  const message = (document.getElementById('message').value || '').trim();

  const phoneRe = /^\+?\d{7,15}$/;
  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  if (!emailRe.test(email)) {
    msgEl.textContent = 'Please enter a valid email address.';
    emailEl.focus();
    return;
  }
  if (!phoneRe.test(phone)) {
    msgEl.textContent = 'Please enter a valid phone number (7–15 digits, optional +).';
    phoneEl.focus();
    return;
  }
  if (!message || message.length < 3) {
    msgEl.textContent = 'Please enter a short message describing your project.';
    document.getElementById('message').focus();
    return;
  }

  // Start UI send animation
  msgEl.textContent = '';
  btn.classList.add('sending');
  btn.disabled = true;

  try {
    const resp = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.value,
        business: form.business.value,
        email,
        phone,
        message
      })
    });

    const data = await resp.json().catch(() => ({}));
    if (resp.ok) {
      btn.classList.remove('sending');
      btn.classList.add('sent');
      btn.querySelector('.send-text').textContent = 'Sent ✓';
      form.reset();
      msgEl.textContent = 'Thanks — message sent. I will reply soon.';
      setTimeout(() => {
        closeModal();
        btn.classList.remove('sent');
        btn.querySelector('.send-text').textContent = 'Send Message';
        btn.disabled = false;
        msgEl.textContent = '';
      }, 1000);
    } else {
      throw new Error(data.error || 'Failed to send message');
    }
  } catch (err) {
    btn.classList.remove('sending');
    btn.disabled = false;
    msgEl.textContent = 'Sorry — could not send message. Try again later.';
    console.error('Contact send error:', err);
  }
});

// ─── Footer year ───
document.getElementById('year').textContent = new Date().getFullYear();

// ─── Smooth scroll for nav links ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
