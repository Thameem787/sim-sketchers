/* ===================================================
   SIM SKETCHERS — script.js
   Admin Panel, Link Management, Scroll Animations
=================================================== */

// ──────────────────────────────────────────────────
// STATE — loaded from localStorage or defaults
// ──────────────────────────────────────────────────
const STATE = JSON.parse(localStorage.getItem('simSketchers') || '{}');

const DEFAULTS = {
  mobile: '91XXXXXXXXXX',
  callNumber: 'XXXXXXXXXX',
  instagram: 'https://www.instagram.com/simsketchers',
  gallery: [],
  heroImg: null
};

function get(key) {
  return STATE[key] !== undefined ? STATE[key] : DEFAULTS[key];
}

function set(key, value) {
  STATE[key] = value;
  localStorage.setItem('simSketchers', JSON.stringify(STATE));
}

// ──────────────────────────────────────────────────
// LINK UPDATER — update all href links on the page
// ──────────────────────────────────────────────────
function updateAllLinks() {
  const mobile     = get('mobile');
  const callNum    = get('callNumber');
  const instagram  = get('instagram');
  const waBase     = `https://wa.me/${mobile}`;
  const waOrder    = `${waBase}?text=Hi%20Sim%20Sketchers!%20I%20want%20to%20order%20a%20custom%20portrait.`;
  const waPencil   = `${waBase}?text=Hi%20Sim%20Sketchers!%20I'd%20like%20to%20order%20a%20Pencil%20Sketch.`;
  const waColor    = `${waBase}?text=Hi%20Sim%20Sketchers!%20I'd%20like%20to%20order%20a%20Color%20Portrait.`;
  const waLandscape = `${waBase}?text=Hi%20Sim%20Sketchers!%20I'd%20like%20to%20order%20a%20Landscape%20Painting.`;
  const waGallery  = `${waBase}?text=Hi!%20I%20saw%20your%20gallery%20and%20want%20to%20order%20a%20portrait.`;

  const map = {
    'hero-whatsapp-link':    waOrder,
    'hero-call-link':        `tel:${callNum}`,
    'nav-whatsapp-btn':      waOrder,
    'pencil-order-link':     waPencil,
    'color-order-link':      waColor,
    'landscape-order-link':  waLandscape,
    'gallery-whatsapp-link': waGallery,
    'contact-whatsapp-link': waOrder,
    'contact-call-link':     `tel:${callNum}`,
    'contact-instagram-link': instagram,
    'about-instagram-link':  instagram,
    'footer-instagram-link': instagram,
    'footer-whatsapp-link':  waBase
  };

  Object.entries(map).forEach(([id, href]) => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  });
}

// ──────────────────────────────────────────────────
// HERO IMAGE
// ──────────────────────────────────────────────────
function applyHeroImage() {
  const heroImg = get('heroImg');
  if (heroImg) {
    const el = document.getElementById('heroArtImg');
    if (el) el.src = heroImg;
  }
}

// ──────────────────────────────────────────────────
// CUSTOM GALLERY ITEMS
// ──────────────────────────────────────────────────
function applyCustomGallery() {
  const items = get('gallery');
  if (!items || items.length === 0) return;
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  // Append custom items after default ones
  // Remove any previously injected custom items first
  grid.querySelectorAll('.custom-gallery-item').forEach(el => el.remove());

  items.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'gallery-item custom-gallery-item';
    div.innerHTML = `
      <img src="${src}" alt="Custom Artwork ${i + 1}" loading="lazy" />
      <div class="gallery-caption">Custom Artwork</div>
    `;
    grid.appendChild(div);
  });
}

// ──────────────────────────────────────────────────
// ADMIN PANEL OPEN / CLOSE
// ──────────────────────────────────────────────────
function openAdmin() {
  const panel = document.getElementById('adminPanel');
  panel.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Populate current values
  document.getElementById('edit-mobile').value = get('mobile') === 'XXXXXXXXXX' ? '' : get('mobile');
  document.getElementById('edit-instagram').value = get('instagram');

  renderAdminGalleryThumbs();
  renderHeroPreview();
}

function closeAdmin() {
  document.getElementById('adminPanel').classList.add('hidden');
  document.body.style.overflow = '';
}

// ──────────────────────────────────────────────────
// ADMIN — GALLERY UPLOAD
// ──────────────────────────────────────────────────
let pendingGallery = [...(get('gallery') || [])];

function renderAdminGalleryThumbs() {
  const grid = document.getElementById('galleryUploadGrid');
  if (!grid) return;
  grid.innerHTML = '';
  pendingGallery.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'gallery-upload-thumb';
    div.innerHTML = `
      <img src="${src}" alt="Gallery ${i}" />
      <button class="remove-img" onclick="removeGalleryItem(${i})">✕</button>
    `;
    grid.appendChild(div);
  });
}

function removeGalleryItem(index) {
  pendingGallery.splice(index, 1);
  renderAdminGalleryThumbs();
}

function handleGalleryUpload(event) {
  const files = Array.from(event.target.files);
  const maxItems = 8;

  if (pendingGallery.length >= maxItems) {
    showToast('Maximum 8 gallery images allowed.');
    return;
  }

  const toRead = files.slice(0, maxItems - pendingGallery.length);

  toRead.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingGallery.push(e.target.result);
      renderAdminGalleryThumbs();
    };
    reader.readAsDataURL(file);
  });

  event.target.value = '';
}

// ──────────────────────────────────────────────────
// ADMIN — HERO UPLOAD
// ──────────────────────────────────────────────────
let pendingHeroImg = get('heroImg');

function renderHeroPreview() {
  const preview = document.getElementById('heroPreview');
  if (!preview) return;
  if (pendingHeroImg) {
    preview.style.display = 'block';
    preview.innerHTML = `<img src="${pendingHeroImg}" alt="Hero Preview" />`;
  } else {
    preview.style.display = 'none';
    preview.innerHTML = '';
  }
}

function handleHeroUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    pendingHeroImg = e.target.result;
    renderHeroPreview();
    showToast('Hero image ready — click Save to apply.');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

// ──────────────────────────────────────────────────
// ADMIN — SAVE CHANGES
// ──────────────────────────────────────────────────
function saveAdminChanges() {
  const mobileInput = document.getElementById('edit-mobile').value.trim();
  const igInput = document.getElementById('edit-instagram').value.trim();

  if (mobileInput) {
    // Normalize: strip any leading + or spaces
    const cleaned = mobileInput.replace(/\s+/g, '').replace(/^\+/, '');
    set('mobile', cleaned);

    // Also set call number (last 10 digits)
    const callNum = cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;
    set('callNumber', callNum);
  }

  if (igInput) {
    // Ensure it's a valid URL
    const url = igInput.startsWith('http') ? igInput : `https://www.instagram.com/${igInput.replace('@', '')}`;
    set('instagram', url);
  }

  set('gallery', pendingGallery);

  if (pendingHeroImg) {
    set('heroImg', pendingHeroImg);
    applyHeroImage();
  }

  updateAllLinks();
  applyCustomGallery();
  setupScrollAnimations(); // Re-observe new gallery items

  closeAdmin();
  showToast('✓ Changes saved successfully!');
}

// ──────────────────────────────────────────────────
// NAVBAR SCROLL BEHAVIOR
// ──────────────────────────────────────────────────
function setupNavbar() {
  const navbar = document.getElementById('navbar');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
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
// SCROLL REVEAL ANIMATIONS
// ──────────────────────────────────────────────────
function setupScrollAnimations() {
  // Add reveal class to key elements
  const targets = document.querySelectorAll(
    '.price-card, .gallery-item, .pillar, .about-img, .section-header, .hero-stats .stat, .floating-card'
  );

  targets.forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ──────────────────────────────────────────────────
// SMOOTH SECTION SCROLL with active link highlight
// ──────────────────────────────────────────────────
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ──────────────────────────────────────────────────
// TOAST NOTIFICATION
// ──────────────────────────────────────────────────
let toastEl = null;
function showToast(msg) {
  if (toastEl) { toastEl.remove(); }
  toastEl = document.createElement('div');
  toastEl.textContent = msg;
  Object.assign(toastEl.style, {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#0a0a0a',
    color: '#ffffff',
    padding: '0.875rem 2rem',
    borderRadius: '50px',
    fontSize: '0.88rem',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    zIndex: '9999',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    opacity: '0',
    transition: 'opacity 0.3s ease',
    whiteSpace: 'nowrap'
  });
  document.body.appendChild(toastEl);
  requestAnimationFrame(() => { toastEl.style.opacity = '1'; });
  setTimeout(() => {
    if (toastEl) {
      toastEl.style.opacity = '0';
      setTimeout(() => { if (toastEl) { toastEl.remove(); toastEl = null; } }, 300);
    }
  }, 3000);
}

// ──────────────────────────────────────────────────
// MARQUEE — pause on hover
// ──────────────────────────────────────────────────
function setupMarquee() {
  const inner = document.querySelector('.marquee-inner');
  if (!inner) return;
  inner.addEventListener('mouseenter', () => { inner.style.animationPlayState = 'paused'; });
  inner.addEventListener('mouseleave', () => { inner.style.animationPlayState = 'running'; });
}

// ──────────────────────────────────────────────────
// GALLERY LIGHTBOX (simple)
// ──────────────────────────────────────────────────
function setupLightbox() {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  Object.assign(lightbox.style, {
    display: 'none',
    position: 'fixed',
    inset: '0',
    background: 'rgba(0,0,0,0.92)',
    zIndex: '2000',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'zoom-out',
    padding: '2rem'
  });
  lightbox.innerHTML = '<img id="lightboxImg" style="max-width:90%;max-height:90vh;border-radius:12px;box-shadow:0 40px 100px rgba(0,0,0,0.5);object-fit:contain;" />';
  document.body.appendChild(lightbox);

  lightbox.addEventListener('click', () => {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  });

  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('lightboxImg').src = img.src;
      lightbox.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  // Close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
      if (!document.getElementById('adminPanel').classList.contains('hidden')) {
        closeAdmin();
      }
    }
  });
}

// ──────────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize pending gallery from saved state
  pendingGallery = [...(get('gallery') || [])];

  updateAllLinks();
  applyHeroImage();
  applyCustomGallery();
  setupNavbar();
  setupScrollAnimations();
  setupSmoothScroll();
  setupMarquee();

  // Lightbox setup after a tiny delay to ensure all imgs are in DOM
  setTimeout(setupLightbox, 100);
});
