/* ============================================================
   L'DÉGOMME TOUT — JAVASCRIPT
   ============================================================ */

// ── Année footer ──────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Menu burger ───────────────────────────────────────────────
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));

// ── Animations au scroll ──────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
  });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ── Modal galerie (ajout admin) ───────────────────────────────
const overlay = document.getElementById('modalOverlay');
document.getElementById('openModal').addEventListener('click', () => overlay.classList.add('open'));

function closeModal() { overlay.classList.remove('open'); }
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

const imgs = { before: null, after: null };

function loadImg(input, side) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    imgs[side] = e.target.result;
    document.getElementById('thumb' + cap(side)).src = e.target.result;
    document.getElementById('thumb' + cap(side)).classList.add('show');
    document.getElementById('clear' + cap(side)).classList.add('show');
    document.getElementById('drop'  + cap(side)).classList.add('has-img');
    checkReady();
  };
  reader.readAsDataURL(file);
}

function clearDrop(e, side) {
  e.stopPropagation(); imgs[side] = null;
  document.getElementById('thumb' + cap(side)).src = '';
  document.getElementById('thumb' + cap(side)).classList.remove('show');
  document.getElementById('clear' + cap(side)).classList.remove('show');
  document.getElementById('drop'  + cap(side)).classList.remove('has-img');
  document.getElementById('file'  + cap(side)).value = '';
  checkReady();
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function checkReady() {
  document.getElementById('btnAdd').disabled = !(imgs.before && imgs.after);
  document.getElementById('modalError').textContent = '';
}

function addCard() {
  if (!imgs.before || !imgs.after) {
    document.getElementById('modalError').textContent = '⚠ Veuillez choisir les deux photos.';
    return;
  }
  const title  = document.getElementById('cardTitle').value.trim() || 'Nouvelle réalisation';
  const desc   = document.getElementById('cardDesc').value.trim();
  const grid   = document.getElementById('galleryGrid');
  const addBtn = document.getElementById('openModal');
  const id     = Date.now();
  const card   = document.createElement('div');
  card.className = 'ba-card reveal'; card.dataset.id = id;
  const del = `<button class="ba-delete" onclick="deleteCard(${id})" style="display:${adminMode ? '' : 'none'}">✕ Supprimer</button>`;
  card.innerHTML =
    `<div class="ba-photos">
      <div class="ba-side"><img src="${imgs.before}" alt="avant"/><span class="ba-badge avant">AVANT</span></div>
      <div class="ba-divider"></div>
      <div class="ba-side"><img src="${imgs.after}" alt="après"/><span class="ba-badge apres">APRÈS</span></div>
    </div>
    <div class="ba-info">
      <div><div class="ba-title">${title}</div>${desc ? `<div class="ba-desc">${desc}</div>` : ''}</div>
      ${del}
    </div>`;
  grid.insertBefore(card, addBtn);
  obs.observe(card);
  closeModal();
  ['before', 'after'].forEach(s => clearDrop({ stopPropagation: () => {} }, s));
  document.getElementById('cardTitle').value = '';
  document.getElementById('cardDesc').value  = '';
  document.getElementById('btnAdd').disabled  = true;
}

function deleteCard(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  if (card) { card.style.transition = 'opacity .3s'; card.style.opacity = '0'; setTimeout(() => card.remove(), 300); }
}

// ── Formulaire de contact ─────────────────────────────────────
function cfLoad(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('cfPreview').src = e.target.result;
    document.getElementById('cfPreview').classList.add('show');
    document.getElementById('cfFilename').textContent = '📎 ' + file.name;
    document.getElementById('cfFilename').classList.add('show');
    document.getElementById('cfClearBtn').classList.add('show');
    document.getElementById('cfPhotoZone').classList.add('loaded');
  };
  reader.readAsDataURL(file);
}

function cfClear(e) {
  e.stopPropagation();
  document.getElementById('cfPreview').src = '';        document.getElementById('cfPreview').classList.remove('show');
  document.getElementById('cfFilename').textContent = ''; document.getElementById('cfFilename').classList.remove('show');
  document.getElementById('cfClearBtn').classList.remove('show');
  document.getElementById('cfPhotoZone').classList.remove('loaded');
  document.getElementById('cfPhotoInput').value = '';
}

// ✏️ Remplacer cette fonction par l'intégration Formspree quand disponible
function handleSubmit() {
  alert('✅ Merci pour votre message !\nJe vous recontacte rapidement.\n\n📞 06 42 89 93 33\n✉ ldegommetout@gmail.com');
}

// ── Administration ────────────────────────────────────────────
// ✏️ Hash SHA-256 du mot de passe "laurasayes"
const HASH = 'ec7d36d45c37c06d2041d189c133308193550c44fd6bd09d09d1e31601d296b6';
let adminMode = false;

async function sha256(msg) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toggleAdmin() {
  if (adminMode) { logoutAdmin(); return; }
  document.getElementById('adminModal').classList.add('open');
  setTimeout(() => document.getElementById('adminPwd').focus(), 100);
}

async function checkAdmin() {
  const h = await sha256(document.getElementById('adminPwd').value);
  if (h === HASH) {
    adminMode = true;
    document.getElementById('adminModal').classList.remove('open');
    document.getElementById('adminPwd').value   = '';
    document.getElementById('adminErr').textContent = '';
    document.getElementById('openModal').style.display = '';
    document.getElementById('adminBar').classList.add('on');
    document.getElementById('adminBtn').textContent = 'Quitter admin';
    document.querySelectorAll('.ba-delete').forEach(b => b.style.display = '');
  } else {
    document.getElementById('adminErr').textContent = '❌ Mot de passe incorrect';
  }
}

function logoutAdmin() {
  adminMode = false;
  document.getElementById('openModal').style.display = 'none';
  document.getElementById('adminBar').classList.remove('on');
  document.getElementById('adminBtn').textContent = 'Admin';
  document.querySelectorAll('.ba-delete').forEach(b => b.style.display = 'none');
}
