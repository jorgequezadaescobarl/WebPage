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

// ===== BOOKING FORM: Formspree via fetch (campos dinámicos) =====
const FORMSPREE_BOOKING = 'https://formspree.io/f/xeepkvna';

async function submitToFormspree(url, formEl, btnEl, successMsg) {
  const originalText = btnEl.textContent;
  btnEl.textContent = 'ENVIANDO...';
  btnEl.disabled = true;
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: new FormData(formEl),
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      showToast(successMsg);
      return true;
    } else {
      const data = await res.json().catch(() => ({}));
      const errMsg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Error al enviar. Intentá de nuevo.';
      showToast('Error: ' + errMsg);
      return false;
    }
  } catch {
    showToast('Sin conexión. Revisá tu internet e intentá de nuevo.');
    return false;
  } finally {
    btnEl.textContent = originalText;
    btnEl.disabled = false;
  }
}

// ===== CONTACT TABS =====
document.querySelectorAll('.contact-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.contact-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    const target = tab.dataset.tab;
    document.getElementById('messagePanel').hidden = target !== 'message';
    document.getElementById('bookingPanel').hidden = target !== 'booking';
  });
});

// ===== CALENDARIO DE CITAS =====
(function () {
  const SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
  let currentYear, currentMonth, selectedDate;

  const calDays   = document.getElementById('calDays');
  const calLabel  = document.getElementById('calMonthLabel');
  const calPrev   = document.getElementById('calPrev');
  const calNext   = document.getElementById('calNext');
  const step1     = document.getElementById('calStep1');
  const step2     = document.getElementById('calStep2');
  const step3     = document.getElementById('calStep3');

  if (!calDays) return;

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const now = new Date();
  currentYear  = now.getFullYear();
  currentMonth = now.getMonth();

  function renderCalendar() {
    calLabel.textContent = `${MESES[currentMonth]} ${currentYear}`;
    calDays.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1);
    // Lunes = 0
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // mínimo mañana

    // Celdas vacías al inicio
    for (let i = 0; i < startDow; i++) {
      const empty = document.createElement('span');
      empty.className = 'cal-day empty';
      calDays.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dow = date.getDay(); // 0=dom, 6=sáb
      const isWeekend = dow === 0 || dow === 6;
      const isPast = date < minDate;
      const btn = document.createElement('button');
      btn.className = 'cal-day' + (isWeekend || isPast ? ' disabled' : '');
      btn.textContent = d;
      btn.setAttribute('role', 'gridcell');
      if (isWeekend || isPast) {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
      } else {
        btn.addEventListener('click', () => selectDate(date));
      }
      calDays.appendChild(btn);
    }

    // Prev: no ir antes del mes actual
    calPrev.disabled = currentYear === now.getFullYear() && currentMonth === now.getMonth();
  }

  function selectDate(date) {
    selectedDate = date;
    step1.hidden = true;
    step2.hidden = false;

    const label = document.getElementById('calSelectedDateLabel');
    const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    label.textContent = `${dias[date.getDay()]} ${date.getDate()} de ${MESES[date.getMonth()]} ${date.getFullYear()}`;

    renderSlots();
  }

  function renderSlots() {
    const container = document.getElementById('calSlots');
    container.innerHTML = '';
    SLOTS.forEach(slot => {
      const btn = document.createElement('button');
      btn.className = 'cal-slot-btn';
      btn.textContent = slot;
      btn.setAttribute('role', 'listitem');
      btn.addEventListener('click', () => selectSlot(slot));
      container.appendChild(btn);
    });
  }

  function selectSlot(slot) {
    step2.hidden = true;
    step3.hidden = false;

    const dias  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const dateStr = `${dias[selectedDate.getDay()]} ${selectedDate.getDate()} de ${MESES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

    document.getElementById('calBookingSummary').innerHTML =
      `<div class="cal-summary-item"><span>📅</span> ${dateStr}</div>` +
      `<div class="cal-summary-item"><span>🕐</span> ${slot} — ${addHour(slot)} (1 hora)</div>`;

    document.getElementById('bookingDate').value = dateStr;
    document.getElementById('bookingSlot').value = `${slot} — ${addHour(slot)}`;
    document.getElementById('bookingSubject').value = `Reunión agendada: ${dateStr} ${slot}`;
  }

  function addHour(slot) {
    const [h, m] = slot.split(':').map(Number);
    return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  calPrev.addEventListener('click', () => {
    if (currentMonth === 0) { currentMonth = 11; currentYear--; }
    else currentMonth--;
    renderCalendar();
  });

  calNext.addEventListener('click', () => {
    if (currentMonth === 11) { currentMonth = 0; currentYear++; }
    else currentMonth++;
    renderCalendar();
  });

  document.getElementById('calBackToDate').addEventListener('click', () => {
    step2.hidden = true; step1.hidden = false;
  });

  document.getElementById('calBackToSlots').addEventListener('click', () => {
    step3.hidden = true; step2.hidden = false;
  });

  // Booking form submit
  document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const ok = await submitToFormspree(FORMSPREE_BOOKING, e.target, btn, '¡Reunión confirmada! Te enviamos los detalles por correo.');
    if (ok) {
      step3.hidden = true;
      step1.hidden = false;
      e.target.reset();
      selectedDate = null;
      renderCalendar();
    }
  });

  renderCalendar();
})();

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

// ===== HERO PARTICLES (canvas) =====
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const PARTICLE_COUNT = 55;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.3,
    dx: (Math.random() - 0.5) * 0.35,
    dy: (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.5 + 0.1,
    lime: Math.random() < 0.18,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connection lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const opacity = (1 - dist / 110) * 0.06;
          ctx.strokeStyle = `rgba(198,255,0,${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.lime
        ? `rgba(198,255,0,${p.alpha})`
        : `rgba(255,255,255,${p.alpha * 0.5})`;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    requestAnimationFrame(draw);
  }

  // Respect reduced motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw();
  }
})();

// ===== HERO CODE WINDOW TYPING EFFECT =====
(function () {
  const lines = document.querySelectorAll('.code-body .code-line');
  if (!lines.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  lines.forEach(line => {
    line.style.opacity = '0';
    line.style.transform = 'translateX(-10px)';
    line.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
  });

  lines.forEach((line, i) => {
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateX(0)';
    }, 900 + i * 110);
  });
})();

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
