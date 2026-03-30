// ===== SCROLL PROGRESS BAR =====
const progressBar = document.getElementById('progressBar');
function updateProgress() {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

// ===== NAVBAR: SCROLL EFFECT + ACTIVE LINKS =====
const navbar = document.querySelector('.navbar');
const navLinks = document.querySelectorAll('.nav-pill a');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(a => {
    const href = a.getAttribute('href').replace('#', '');
    a.classList.toggle('active', href === current && current !== '');
  });
}
window.addEventListener('scroll', onScroll, { passive: true });

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling;
    const isOpen = btn.classList.contains('open');

    document.querySelectorAll('.faq-question').forEach(b => {
      b.classList.remove('open');
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });

    if (!isOpen) {
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  });
});

// ===== CONTACT SELECT: STYLE WHEN FILLED =====
const serviceSelect = document.getElementById('contact-service');
if (serviceSelect) {
  serviceSelect.addEventListener('change', () => {
    serviceSelect.classList.toggle('filled', serviceSelect.value !== '');
  });
}

// ===== TOAST NOTIFICATION =====
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 4000);
}

// ===== NEWSLETTER FORM =====
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  showToast(`¡Suscripción exitosa! Te enviaremos novedades a ${input.value}`);
  input.value = '';
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast("¡Mensaje enviado! Te respondemos en menos de un día hábil.");
  e.target.reset();
  if (serviceSelect) serviceSelect.classList.remove('filled');
});

// ===== ANIMATED COUNTERS =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1600;
  const step = target / (duration / 16);
  let current = 0;

  const tick = () => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current);
    if (current < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.service-card, .portfolio-card, .testimonial-card, .blog-card, ' +
  '.stat-item, .faq-item, .stack-category, .process-step'
).forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  revealObserver.observe(el);
});

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
