/**
 * BHAVYARAJSINH — FULL-STACK SOFTWARE ENGINEER PORTFOLIO
 * Main Interactive Application Script
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBackgroundCanvas();
  initProfileCard3D();
  initMetricCounters();
  initSkillFilters();
  initArchitectureModals();
  initResumeModal();
  initCommandPalette();
  initContactForm();
  initCopyButtons();
  initMobileNav();
});

/* --------------------------------------------------------------------------
   1. Theme Toggle (Dark / Light) with LocalStorage persistence
   -------------------------------------------------------------------------- */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;
  
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  htmlEl.setAttribute('data-theme', savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('portfolio-theme', newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }
}

/* --------------------------------------------------------------------------
   Profile Card 3D Hover Tilt & Specular Glare React
   -------------------------------------------------------------------------- */
function initProfileCard3D() {
  const card = document.getElementById('profile-card-3d');
  const glare = document.getElementById('profile-card-glare');
  if (!card) return;

  let bounds;

  function onMouseEnter() {
    bounds = card.getBoundingClientRect();
  }

  function onMouseMove(e) {
    if (!bounds) bounds = card.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    const xPct = mouseX / bounds.width;
    const yPct = mouseY / bounds.height;

    // Up to 15deg tilt
    const tiltX = (0.5 - yPct) * 15;
    const tiltY = (xPct - 0.5) * 15;

    card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glare) {
      card.style.setProperty('--glare-x', `${(xPct * 100).toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${(yPct * 100).toFixed(1)}%`);
    }
  }

  function onMouseLeave() {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
  }

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'none';
    onMouseEnter();
  });
  card.addEventListener('mousemove', onMouseMove);
  card.addEventListener('mouseleave', onMouseLeave);
}


/* --------------------------------------------------------------------------
   2. Background Tech Grid & Particle Canvas
   -------------------------------------------------------------------------- */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.floor(Math.min(width, 1400) / 35);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.8
    });
  }

  let mouseX = -1000;
  let mouseY = -1000;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const dotColor = isLight ? 'rgba(15, 23, 42, 0.25)' : 'rgba(56, 189, 248, 0.35)';
    const lineColor = isLight ? 'rgba(15, 23, 42, 0.04)' : 'rgba(56, 189, 248, 0.06)';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = lineColor;
          ctx.stroke();
        }
      }

      // Mouse interactive connection
      const mdx = p.x - mouseX;
      const mdy = p.y - mouseY;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < 120) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.18)';
        ctx.stroke();
      }
    }

    requestAnimationFrame(render);
  }

  render();
}


/* --------------------------------------------------------------------------
   4. Animated Metric Counters
   -------------------------------------------------------------------------- */
function initMetricCounters() {
  const counters = document.querySelectorAll('.metric-val');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1200;
          const stepTime = 30;
          const totalSteps = duration / stepTime;
          const increment = target / totalSteps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = target;
              clearInterval(timer);
            } else {
              counter.textContent = Math.floor(current);
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsWrap = document.querySelector('.hero-metrics');
  if (metricsWrap) observer.observe(metricsWrap);
}

/* --------------------------------------------------------------------------
   5. Filterable Skills Matrix
   -------------------------------------------------------------------------- */
function initSkillFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        if (filter === 'all' || category.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. Architecture Deep-Dive Specs (Modal & Content)
   -------------------------------------------------------------------------- */
const PROJECT_SPECS = {
  cloudpulse: {
    title: 'CloudPulse — Architecture Specification',
    subtitle: 'Distributed Telemetry, BullMQ Worker Pipeline & WebSocket Streaming',
    content: `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div>
          <h4 style="color:var(--accent-cyan); font-family:var(--font-heading); margin-bottom:8px;">1. Problem Definition & Concurrency Needs</h4>
          <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.6;">
            Monitoring hundreds of customer endpoints simultaneously using synchronous Node timers causes heap spikes and blockages in Node's single-threaded event loop. We needed an asynchronous distributed job processor capable of scheduling, executing, and recording latency at sub-second granularity.
          </p>
        </div>

        <div>
          <h4 style="color:var(--accent-cyan); font-family:var(--font-heading); margin-bottom:8px;">2. High-Level Architecture</h4>
          <div style="background:var(--bg-surface-elevated); padding:16px; border-radius:8px; border:1px solid var(--border-subtle); font-family:var(--font-mono); font-size:0.8rem; line-height:1.8;">
            [React Dashboard (Socket.io)] <---> [API Gateway & WebSocket Server]
                                                    |
                                            (Redis Job Dispatcher)
                                                    |
                                            [BullMQ Worker Pool (5 Nodes)]
                                                    |
                                 +------------------+------------------+
                                 |                                     |
                         [HTTP Health Prober]                  [TimescaleDB / Postgres]
                         (TLS, DNS, Status Code)               (Aggregated Metrics)
          </div>
        </div>

        <div>
          <h4 style="color:var(--accent-cyan); font-family:var(--font-heading); margin-bottom:8px;">3. Key Engineering Decisions</h4>
          <ul style="color:var(--text-secondary); font-size:0.88rem; line-height:1.7; padding-left:20px;">
            <li><strong>Worker Concurrency:</strong> Configured 25 concurrent jobs per worker thread with exponential backoff on network timeouts.</li>
            <li><strong>Circuit Breaking:</strong> Automatic throttling when destination servers return 5xx errors to prevent hammering struggling third-party APIs.</li>
            <li><strong>State Broadcast:</strong> Sub-50ms push updates via Socket.io channels segmented by organization IDs to prevent cross-tenant data leakage.</li>
          </ul>
        </div>
      </div>
    `
  },
  omnicommerce: {
    title: 'OmniCommerce — System Design Spec',
    subtitle: 'Atomic Transaction Bounds, Idempotent Webhooks & SQL Query Plans',
    content: `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div>
          <h4 style="color:var(--accent-cyan); font-family:var(--font-heading); margin-bottom:8px;">1. Concurrency & Inventory Race Conditions</h4>
          <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.6;">
            During flash-sales, multiple buyers attempt to purchase the final items in stock concurrently. A naive "check stock then decrement" pattern suffers from Dirty Reads and overselling.
          </p>
        </div>

        <div>
          <h4 style="color:var(--accent-cyan); font-family:var(--font-heading); margin-bottom:8px;">2. SQL Transactional Strategy</h4>
          <div style="background:var(--bg-surface-elevated); padding:16px; border-radius:8px; border:1px solid var(--border-subtle); font-family:var(--font-mono); font-size:0.8rem; line-height:1.8;">
            BEGIN TRANSACTION;
            -- Acquire row-level pessimistic lock
            SELECT stock_count FROM products WHERE id = $1 FOR UPDATE;
            
            -- If stock_count >= quantity
            UPDATE products SET stock_count = stock_count - $2 WHERE id = $1;
            INSERT INTO order_items (order_id, product_id, qty) VALUES ($3, $1, $2);
            COMMIT;
          </div>
        </div>

        <div>
          <h4 style="color:var(--accent-cyan); font-family:var(--font-heading); margin-bottom:8px;">3. Idempotent Payment Webhooks</h4>
          <ul style="color:var(--text-secondary); font-size:0.88rem; line-height:1.7; padding-left:20px;">
            <li>Stripe webhooks are verified via HMAC-SHA256 signatures before reading payloads.</li>
            <li>Every event ID is recorded in an <code>idempotency_keys</code> table with a unique index. Duplicate webhook retries are immediately acknowledged with <code>200 OK</code> without duplicate order fulfillment.</li>
          </ul>
        </div>
      </div>
    `
  },
  devconnect: {
    title: 'DevConnect — Real-Time Sync Spec',
    subtitle: 'Operational Transformation, Socket Rooms & Redis Presence',
    content: `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <div>
          <h4 style="color:var(--accent-cyan); font-family:var(--font-heading); margin-bottom:8px;">1. Real-Time Collaboration Conflict Resolution</h4>
          <p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.6;">
            When multiple software developers edit documents simultaneously, transmitting the entire file on every keystroke causes excessive network traffic and overwriting conflicts.
          </p>
        </div>

        <div>
          <h4 style="color:var(--accent-cyan); font-family:var(--font-heading); margin-bottom:8px;">2. Delta Synchronization Protocol</h4>
          <div style="background:var(--bg-surface-elevated); padding:16px; border-radius:8px; border:1px solid var(--border-subtle); font-family:var(--font-mono); font-size:0.8rem; line-height:1.8;">
            Client A (Types char) ---> Emits: { line: 14, col: 22, insert: "const", rev: 104 }
                                                    |
                                      [Node.js Room Broadcaster]
                                      (Validates revision order)
                                                    |
                                  Broadcasts Delta to Client B & C
                                  (Auto-applies with client offset transformation)
          </div>
        </div>

        <div>
          <h4 style="color:var(--accent-cyan); font-family:var(--font-heading); margin-bottom:8px;">3. Presence & Ephemeral Memory</h4>
          <ul style="color:var(--text-secondary); font-size:0.88rem; line-height:1.7; padding-left:20px;">
            <li>Active cursors and typing states are stored in Redis Hashes with a 15-second TTL heartbeat.</li>
            <li>If a user abruptly disconnects (tab close, network drop), Redis expires their presence key, preventing ghost cursors.</li>
          </ul>
        </div>
      </div>
    `
  }
};

function initArchitectureModals() {
  const specModal = document.getElementById('spec-modal');
  const specTitle = document.getElementById('spec-modal-title');
  const specSubtitle = document.getElementById('spec-modal-subtitle');
  const specContent = document.getElementById('spec-modal-content');
  const closeBtn = document.getElementById('close-spec-modal');

  document.querySelectorAll('.view-spec-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalKey = btn.getAttribute('data-modal');
      const data = PROJECT_SPECS[modalKey];
      if (data && specModal) {
        specTitle.textContent = data.title;
        specSubtitle.textContent = data.subtitle;
        specContent.innerHTML = data.content;
        specModal.classList.add('open');
        specModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  if (closeBtn && specModal) {
    closeBtn.addEventListener('click', () => {
      specModal.classList.remove('open');
      specModal.setAttribute('aria-hidden', 'true');
    });
  }

  // Close on backdrop click
  if (specModal) {
    specModal.addEventListener('click', (e) => {
      if (e.target === specModal) {
        specModal.classList.remove('open');
        specModal.setAttribute('aria-hidden', 'true');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   7. Resume Preview Modal & PDF Action
   -------------------------------------------------------------------------- */
function initResumeModal() {
  const resumeModal = document.getElementById('resume-modal');
  const openBtn = document.getElementById('open-resume-btn');
  const cardBtn = document.getElementById('card-download-resume');
  const closeBtn = document.getElementById('close-resume-modal');
  const downloadBtn = document.getElementById('download-resume-file');

  function openModal() {
    if (resumeModal) {
      resumeModal.classList.add('open');
      resumeModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (resumeModal) {
      resumeModal.classList.remove('open');
      resumeModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (cardBtn) cardBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeModal();
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      showToast('Downloading Gohil Bhavyarajsinh Resume (PDF)...');
    });
  }
}

/* --------------------------------------------------------------------------
   8. Command Palette (Ctrl+K / Cmd+K)
   -------------------------------------------------------------------------- */
function initCommandPalette() {
  const palette = document.getElementById('cmd-palette');
  const triggerBtn = document.getElementById('cmd-k-trigger');
  const searchInput = document.getElementById('cmd-search-input');
  const resultsContainer = document.getElementById('cmd-results-list');

  if (!palette || !searchInput) return;

  function openPalette() {
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    searchInput.value = '';
    searchInput.focus();
    filterItems('');
  }

  function closePalette() {
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
  }

  if (triggerBtn) triggerBtn.addEventListener('click', openPalette);

  // Global hotkeys (Ctrl+K, Cmd+K, Esc)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palette.classList.contains('open')) {
        closePalette();
      } else {
        openPalette();
      }
    }
    if (e.key === 'Escape' && palette.classList.contains('open')) {
      closePalette();
    }
  });

  palette.addEventListener('click', (e) => {
    if (e.target === palette) closePalette();
  });

  // Filter items based on user search
  function filterItems(query) {
    const q = query.toLowerCase().trim();
    const items = resultsContainer.querySelectorAll('.cmd-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (!q || text.includes(q)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  searchInput.addEventListener('input', (e) => {
    filterItems(e.target.value);
  });

  // Action clicks
  resultsContainer.querySelectorAll('.cmd-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      const target = item.getAttribute('data-target');

      closePalette();

      if (action === 'navigate' && target) {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (action === 'resume') {
        const resumeModal = document.getElementById('resume-modal');
        if (resumeModal) resumeModal.classList.add('open');
      } else if (action === 'copy-email') {
        copyToClipboard('gohilbhavyarajsinhji@gmail.com');
      } else if (action === 'toggle-theme') {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) toggleBtn.click();
      }
    });
  });
}

/* --------------------------------------------------------------------------
   9. Contact Form Validation & Toast Feedback
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('form-toast');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      nameInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      nameInput.parentElement.classList.remove('has-error');
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      emailInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      emailInput.parentElement.classList.remove('has-error');
    }

    // Validate Message
    if (!messageInput.value.trim() || messageInput.value.trim().length < 5) {
      messageInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      messageInput.parentElement.classList.remove('has-error');
    }

    if (isValid) {
      const submitBtn = document.getElementById('submit-form-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending Message...</span>';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Message Sent ✓</span>';
        if (toast) toast.classList.add('show');
        showToast('Message dispatched! Thank you for connecting.');
        form.reset();

        setTimeout(() => {
          submitBtn.innerHTML = `
            <span>Send Message</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          `;
          if (toast) toast.classList.remove('show');
        }, 5000);
      }, 700);
    }
  });
}

/* --------------------------------------------------------------------------
   10. Quick Copy Buttons & Global Toast Notifications
   -------------------------------------------------------------------------- */
function initCopyButtons() {
  const quickEmailBtn = document.getElementById('quick-copy-email');
  const copyText = document.getElementById('copy-email-text');

  if (quickEmailBtn) {
    quickEmailBtn.addEventListener('click', () => {
      copyToClipboard('gohilbhavyarajsinhji@gmail.com');
      if (copyText) {
        copyText.textContent = 'Copied to Clipboard!';
        setTimeout(() => {
          copyText.textContent = 'Copy Email';
        }, 2500);
      }
    });
  }

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      if (text) copyToClipboard(text);
    });
  });
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied "${text}" to clipboard`);
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast(`Copied "${text}" to clipboard`);
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }, 3000);
}

/* --------------------------------------------------------------------------
   11. Mobile Navigation Toggle
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}
