/* ===================================================
   SIM SKETCHERS — script.js (Full Updated)
   All-photo edit panel, 50-photo gallery, lightbox
=================================================== */

// ──────────────────────────────────────────────────
// STATE — persisted in localStorage
// ──────────────────────────────────────────────────
const STATE = JSON.parse(localStorage.getItem('simSketchers') || '{}');

const DEFAULTS = {
  mobile:      '918248831411',
  callNumber:  '8248831411',
  instagram:   'https://www.instagram.com/sims_sketches?igsh=MWw5ZjlvcW9pZG1yMw==',
  heroImg:     null,
  artistImg:   null,
  igProfileImg: null,
  price1Img:   null,
  price2Img:   null,
  price3Img:   null,
  about1Img:   null,
  about2Img:   null,
  gallery:     []
};

function get(key) { return STATE[key] !== undefined ? STATE[key] : DEFAULTS[key]; }
function set(key, value) { STATE[key] = value; localStorage.setItem('simSketchers', JSON.stringify(STATE)); }

// ──────────────────────────────────────────────────
// LINK UPDATER
// ──────────────────────────────────────────────────
function updateAllLinks() {
  const mobile  = get('mobile');
  const callNum = get('callNumber');
  const ig      = get('instagram');
  const waBase  = `https://wa.me/${mobile}`;

  const map = {
    'hero-whatsapp-link':     `${waBase}?text=Hi%20Sim%20Sketchers!%20I%20want%20to%20order%20a%20custom%20portrait.`,
    'hero-call-link':         `tel:${callNum}`,
    'nav-whatsapp-btn':       `${waBase}?text=Hi%20Sim%20Sketchers!%20I%20want%20to%20order.`,
    'pencil-order-link':      `${waBase}?text=Hi%20Sim%20Sketchers!%20I'd%20like%20to%20order%20a%20Pencil%20Sketch.`,
    'color-order-link':       `${waBase}?text=Hi%20Sim%20Sketchers!%20I'd%20like%20to%20order%20a%20Color%20Portrait.`,
    'landscape-order-link':   `${waBase}?text=Hi%20Sim%20Sketchers!%20I'd%20like%20to%20order%20a%20Landscape%20Painting.`,
    'gallery-whatsapp-link':  `${waBase}?text=Hi!%20I%20saw%20your%20gallery%20and%20want%20to%20order%20a%20portrait.`,
    'contact-whatsapp-link':  `${waBase}?text=Hi%20Sim%20Sketchers!%20I%20want%20to%20order%20a%20custom%20portrait.`,
    'contact-call-link':      `tel:${callNum}`,
    'contact-instagram-link': ig,
    'artist-ig-link':         ig,
    'ig-showcase-link':       ig,
    'about-instagram-link':   ig,
    'footer-instagram-link':  ig,
    'footer-whatsapp-link':   waBase
  };

  Object.entries(map).forEach(([id, href]) => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  });
}

// ──────────────────────────────────────────────────
// APPLY ALL SAVED IMAGES ON LOAD
// ──────────────────────────────────────────────────
const IMG_MAP = {
  heroImg:     ['heroArtImg'],
  artistImg:   ['artistPhotoImg'],
  igProfileImg:['navBrandLogo', 'igShowcaseImg'],
  price1Img:   ['price1CardImg'],
  price2Img:   ['price2CardImg'],
  price3Img:   ['price3CardImg'],
  about1Img:   ['aboutImg1'],
  about2Img:   ['aboutImg2']
};

function applyAllSavedImages() {
  Object.entries(IMG_MAP).forEach(([key, ids]) => {
    const src = get(key);
    if (src) ids.forEach(id => { const el = document.getElementById(id); if (el) el.src = src; });
  });
}

// ──────────────────────────────────────────────────
// SINGLE IMAGE UPLOAD HANDLER
// Called by inline onchange in HTML
// ──────────────────────────────────────────────────
function handleSingleUpload(event, stateKey, previewId, ...targetIds) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const src = e.target.result;
    // Update admin preview
    const preview = document.getElementById(previewId);
    if (preview) preview.src = src;
    // Live-update page images
    targetIds.forEach(id => { const el = document.getElementById(id); if (el) el.src = src; });
    // Store in temp (will be saved on Save)
    pendingSingleImgs[stateKey] = src;
    showToast(`Image updated — click "Save All Changes" to keep it.`);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

// Temp staging for single images before save
let pendingSingleImgs = {};

// ──────────────────────────────────────────────────
// GALLERY — 50 photo capacity
// ──────────────────────────────────────────────────
const GALLERY_MAX = 50;
let pendingGallery = [];

function renderAdminGalleryThumbs() {
  const grid = document.getElementById('galleryUploadGrid');
  const badge = document.getElementById('galleryCountBadge');
  if (!grid) return;
  grid.innerHTML = '';
  pendingGallery.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'gallery-upload-thumb';
    div.innerHTML = `<img src="${src}" alt="Gallery ${i + 1}" /><button class="remove-img" onclick="removeGalleryItem(${i})" title="Remove">✕</button>`;
    grid.appendChild(div);
  });
  if (badge) badge.textContent = `${pendingGallery.length} / ${GALLERY_MAX}`;
}

function removeGalleryItem(index) {
  pendingGallery.splice(index, 1);
  renderAdminGalleryThumbs();
}

function handleGalleryUpload(event) {
  const files = Array.from(event.target.files);
  const remaining = GALLERY_MAX - pendingGallery.length;
  if (remaining <= 0) { showToast(`Maximum ${GALLERY_MAX} images reached.`); return; }
  const toRead = files.slice(0, remaining);
  let loaded = 0;
  toRead.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingGallery.push(e.target.result);
      loaded++;
      if (loaded === toRead.length) renderAdminGalleryThumbs();
    };
    reader.readAsDataURL(file);
  });
  if (files.length > remaining) showToast(`Only ${remaining} more images allowed (max ${GALLERY_MAX}).`);
  event.target.value = '';
}

function applyCustomGallery() {
  const items = get('gallery');
  if (!items || items.length === 0) return;
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  grid.querySelectorAll('.custom-gallery-item').forEach(el => el.remove());
  items.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'gallery-item custom-gallery-item';
    div.innerHTML = `<img src="${src}" alt="Artwork ${i + 1}" loading="lazy" /><div class="gallery-caption">Custom Artwork</div>`;
    grid.appendChild(div);
  });
}

// ──────────────────────────────────────────────────
// ADMIN PASSWORD GATE
// Change ADMIN_PASSWORD below to set your password
// ──────────────────────────────────────────────────
const ADMIN_PASSWORD = 'simsketchers2026';
let adminUnlocked = false; // stays true for the full browser session after first correct entry
let pwdAttempts = 0;
const MAX_ATTEMPTS = 5;

// Called when user clicks the ✏️ pencil trigger in navbar
function openAdmin() {
  if (adminUnlocked) {
    // Already authenticated this session — open panel directly
    _openAdminPanel();
  } else {
    // Show password modal first
    const modal = document.getElementById('adminPasswordModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const input = document.getElementById('adminPwdInput');
      if (input) { input.value = ''; input.focus(); }
      document.getElementById('pwdError').classList.add('hidden');
    }, 50);
  }
}

function closePwdModal() {
  document.getElementById('adminPasswordModal').classList.add('hidden');
  document.body.style.overflow = '';
  document.getElementById('adminPwdInput').value = '';
  document.getElementById('pwdError').classList.add('hidden');
}

function verifyAdminPassword() {
  if (pwdAttempts >= MAX_ATTEMPTS) {
    showToast(`Too many attempts. Please refresh the page.`);
    return;
  }
  const input = document.getElementById('adminPwdInput').value;
  if (input === ADMIN_PASSWORD) {
    adminUnlocked = true;
    pwdAttempts = 0;
    closePwdModal();
    _openAdminPanel();
  } else {
    pwdAttempts++;
    const errEl = document.getElementById('pwdError');
    const remaining = MAX_ATTEMPTS - pwdAttempts;
    errEl.textContent = remaining > 0
      ? `❌ Incorrect password. ${remaining} attempt${remaining !== 1 ? 's' : ''} left.`
      : `🔒 Too many attempts. Refresh the page to try again.`;
    errEl.classList.remove('hidden');
    // Shake animation
    const box = document.querySelector('.pwd-box');
    box.classList.remove('shake');
    void box.offsetWidth; // force reflow to re-trigger animation
    box.classList.add('shake');
    document.getElementById('adminPwdInput').value = '';
    document.getElementById('adminPwdInput').focus();
    if (pwdAttempts >= MAX_ATTEMPTS) {
      document.querySelector('.pwd-submit-btn').disabled = true;
      document.querySelector('.pwd-submit-btn').style.opacity = '0.4';
    }
  }
}

function togglePwdVisibility() {
  const input = document.getElementById('adminPwdInput');
  const btn = document.querySelector('.pwd-toggle');
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// Internal: actually open the admin panel (after auth)
function _openAdminPanel() {
  const panel = document.getElementById('adminPanel');
  panel.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Populate input fields
  const mob = get('mobile');
  document.getElementById('edit-mobile').value = (mob === '91XXXXXXXXXX') ? '' : mob;
  document.getElementById('edit-instagram').value = get('instagram');

  // Populate admin previews from saved state
  const previewMap = {
    heroImg:      'admin-hero-preview',
    artistImg:    'admin-artist-preview',
    igProfileImg: 'admin-igprofile-preview',
    price1Img:    'admin-price1-preview',
    price2Img:    'admin-price2-preview',
    price3Img:    'admin-price3-preview',
    about1Img:    'admin-about1-preview',
    about2Img:    'admin-about2-preview'
  };

  Object.entries(previewMap).forEach(([key, previewId]) => {
    const saved = get(key);
    if (saved) { const el = document.getElementById(previewId); if (el) el.src = saved; }
  });

  // Reset pending singles
  pendingSingleImgs = {};
  pendingGallery = [...(get('gallery') || [])];
  renderAdminGalleryThumbs();
}

function closeAdmin() {
  document.getElementById('adminPanel').classList.add('hidden');
  document.body.style.overflow = '';
}


// ──────────────────────────────────────────────────
// SAVE ALL CHANGES
// ──────────────────────────────────────────────────
function saveAdminChanges() {
  // Contact info
  const mobileInput = document.getElementById('edit-mobile').value.trim();
  const igInput     = document.getElementById('edit-instagram').value.trim();

  if (mobileInput) {
    const cleaned = mobileInput.replace(/\s+/g, '').replace(/^\+/, '');
    set('mobile', cleaned);
    set('callNumber', cleaned.length >= 10 ? cleaned.slice(-10) : cleaned);
  }

  if (igInput) {
    const url = igInput.startsWith('http') ? igInput : `https://www.instagram.com/${igInput.replace('@', '')}`;
    set('instagram', url);
  }

  // Save all pending single images
  Object.entries(pendingSingleImgs).forEach(([key, src]) => set(key, src));

  // Save gallery
  set('gallery', pendingGallery);

  // Apply everything
  updateAllLinks();
  applyAllSavedImages();
  applyCustomGallery();
  setupScrollAnimations();
  setupLightbox();

  closeAdmin();
  showToast('✓ All changes saved successfully!');
}

// ──────────────────────────────────────────────────
// NAVBAR SCROLL
// ──────────────────────────────────────────────────
function setupNavbar() {
  const navbar = document.getElementById('navbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ──────────────────────────────────────────────────
// MOBILE MENU
// ──────────────────────────────────────────────────
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const ham  = document.getElementById('hamburger');
  const isOpen = menu.classList.toggle('open');
  ham.setAttribute('aria-expanded', isOpen);
}

// ──────────────────────────────────────────────────
// SCROLL REVEAL
// ──────────────────────────────────────────────────
function setupScrollAnimations() {
  const targets = document.querySelectorAll(
    '.price-card, .gallery-item, .pillar, .about-img, .section-header, .hero-stats .stat, .floating-card, .artist-card, .ig-profile-ring, .ig-profile-text'
  );
  targets.forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 5) * 70}ms`;
    }
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ──────────────────────────────────────────────────
// SMOOTH SCROLL
// ──────────────────────────────────────────────────
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}

// ──────────────────────────────────────────────────
// MARQUEE PAUSE ON HOVER
// ──────────────────────────────────────────────────
function setupMarquee() {
  const inner = document.querySelector('.marquee-inner');
  if (!inner) return;
  inner.addEventListener('mouseenter', () => inner.style.animationPlayState = 'paused');
  inner.addEventListener('mouseleave', () => inner.style.animationPlayState = 'running');
}

// ──────────────────────────────────────────────────
// LIGHTBOX
// ──────────────────────────────────────────────────
let lightboxEl = null;

function setupLightbox() {
  if (!lightboxEl) {
    lightboxEl = document.createElement('div');
    lightboxEl.id = 'lightbox';
    Object.assign(lightboxEl.style, {
      display: 'none', position: 'fixed', inset: '0',
      background: 'rgba(0,0,0,0.94)', zIndex: '2000',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'zoom-out', padding: '2rem'
    });
    lightboxEl.innerHTML = '<img id="lightboxImg" style="max-width:90%;max-height:90vh;border-radius:12px;box-shadow:0 40px 100px rgba(0,0,0,0.5);object-fit:contain;" />';
    document.body.appendChild(lightboxEl);
    lightboxEl.addEventListener('click', closeLightbox);
  }

  // Attach to all gallery images
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.removeEventListener('click', imgClickHandler);
    img.addEventListener('click', imgClickHandler);
  });
}

function imgClickHandler(e) {
  e.stopPropagation();
  document.getElementById('lightboxImg').src = this.src;
  lightboxEl.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (lightboxEl) { lightboxEl.style.display = 'none'; document.body.style.overflow = ''; }
}

// ──────────────────────────────────────────────────
// TOAST
// ──────────────────────────────────────────────────
let toastEl = null;
function showToast(msg) {
  if (toastEl) toastEl.remove();
  toastEl = document.createElement('div');
  toastEl.textContent = msg;
  Object.assign(toastEl.style, {
    position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
    background: '#0a0a0a', color: '#fff', padding: '0.875rem 2rem', borderRadius: '50px',
    fontSize: '0.88rem', fontWeight: '600', fontFamily: "'Inter', sans-serif",
    zIndex: '9999', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', opacity: '0',
    transition: 'opacity 0.3s ease', whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center'
  });
  document.body.appendChild(toastEl);
  requestAnimationFrame(() => toastEl.style.opacity = '1');
  setTimeout(() => {
    if (toastEl) { toastEl.style.opacity = '0'; setTimeout(() => { if (toastEl) { toastEl.remove(); toastEl = null; } }, 300); }
  }, 3000);
}

// ──────────────────────────────────────────────────
// KEYBOARD SHORTCUTS
// ──────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    if (!document.getElementById('adminPasswordModal').classList.contains('hidden')) closePwdModal();
    if (!document.getElementById('adminPanel').classList.contains('hidden')) closeAdmin();
  }
});

// ──────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  pendingGallery = [...(get('gallery') || [])];

  updateAllLinks();
  applyAllSavedImages();
  applyCustomGallery();
  setupNavbar();
  setupScrollAnimations();
  setupSmoothScroll();
  setupMarquee();
  setTimeout(setupLightbox, 150);
});
