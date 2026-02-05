/* ===========================
   High-end Hardware Website JS
   - Scroll reveals
   - Progress bar
   - Mobile nav
   - Softer tilt / 3D hover
   - Hero stack parallax
   - Counter animation
   - Toast notifications
   - Search demo + chips
   =========================== */

const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

/* ===== Year in footer ===== */
$("#year").textContent = new Date().getFullYear();

/* ===== Scroll progress bar ===== */
const progressBar = $("#progressBar");
function updateProgress() {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  const pct = height > 0 ? (scrollTop / height) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

/* ===== Mobile nav ===== */
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});

$$(".nav__links a").forEach(a => {
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ===== Scroll reveal ===== */
const revealEls = $$("[data-reveal]");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("show");
  });
}, { threshold: 0.12 });

revealEls.forEach(el => io.observe(el));

/* ===== Softer tilt cards (premium feel) ===== */
function attachTilt(el) {
  let rect = null;

  const onMove = (ev) => {
    if (!rect) rect = el.getBoundingClientRect();
    const x = (ev.clientX - rect.left) / rect.width;  // 0..1
    const y = (ev.clientY - rect.top) / rect.height;  // 0..1

    // Reduced for expensive/subtle feel
    const rotY = (x - 0.5) * 6;
    const rotX = (0.5 - y) * 6;

    el.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
    el.style.boxShadow = "0 18px 45px rgba(26,22,19,.18)";
  };

  const onLeave = () => {
    rect = null;
    el.style.transform = "";
    el.style.boxShadow = "";
  };

  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);
  el.addEventListener("blur", onLeave);
}
$$(".tilt").forEach(attachTilt);

/* ===== Counters ===== */
const counters = $$(".stat__num[data-count]");
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = Number(el.dataset.count || 0);
    counterIO.unobserve(el);

    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, { threshold: 0.35 });

counters.forEach(c => counterIO.observe(c));

/* ===== Toast ===== */
const toast = $("#toast");
const toastText = $("#toastText");
const toastClose = $("#toastClose");
let toastTimer = null;

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
toastClose.addEventListener("click", () => toast.classList.remove("show"));

$$(".addBtn").forEach((btn) => {
  btn.addEventListener("click", () => showToast("Added to cart (demo)"));
});

/* ===== Search demo + chips ===== */
const searchInput = $("#searchInput");
const searchBtn = $("#searchBtn");

function runSearch(query) {
  const q = (query || "").trim();
  if (!q) return showToast("Type something to search (demo)");
  showToast(`Searching “${q}” (demo)`);
}
searchBtn.addEventListener("click", () => runSearch(searchInput.value));
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch(searchInput.value);
});

$$(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const val = chip.dataset.chip || chip.textContent;
    searchInput.value = val;
    runSearch(val);
  });
});

/* ===== Copy address ===== */
const copyBtn = $("#copyBtn");
copyBtn?.addEventListener("click", async () => {
  const addr = "329 Nassau Rd, Roosevelt, NY 11575";
  try {
    await navigator.clipboard.writeText(addr);
    showToast("Address copied!");
  } catch {
    showToast("Couldn’t copy (browser blocked).");
  }
});

/* ===== Reduce motion preference ===== */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReduced) {
  $$(".tilt").forEach(el => (el.style.transition = "none"));
  if (heroStack) heroStack.style.transition = "none";
}


/* ===== Bundle modal (Projects section) ===== */
const modal = document.getElementById("bundleModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");
const modalSecondary = document.getElementById("modalSecondary");
const modalPrimary = document.getElementById("modalPrimary");

const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalList = document.getElementById("modalList");

const bundles = {
  deck: {
    title: "Deck Build Essentials",
    desc: "Everything you need for a strong, clean outdoor build—picked for durability and weather resistance.",
    items: ["Exterior deck screws", "Joist hangers & brackets", "Deck sealant / stain", "Pilot bits & driver bits", "Level + tape essentials"]
  },
  kitchen: {
    title: "Kitchen Refresh Kit",
    desc: "Clean finishes and solid installs—ideal for quick upgrades with professional results.",
    items: ["Paint + primer pairing", "Caulk + smoothing tools", "Anchors for rails/shelves", "Cabinet hardware essentials", "Painter’s tape + drop protection"]
  },
  garage: {
    title: "Garage Organization",
    desc: "Sturdy storage basics so you can mount, hang, and organize with confidence.",
    items: ["Wall hooks & rails", "Heavy-duty anchors", "Fastener assortment", "Stud finder + level", "Storage bins + labels"]
  }
};

function openModal(key) {
  const b = bundles[key];
  if (!b) return;

  modalTitle.textContent = b.title;
  modalDesc.textContent = b.desc;

  modalList.innerHTML = "";
  b.items.forEach((it) => {
    const li = document.createElement("li");
    li.textContent = it;
    modalList.appendChild(li);
  });

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".bundleBtn").forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn.dataset.bundle));
});

modalBackdrop.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
modalSecondary.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

modalPrimary.addEventListener("click", () => {
  closeModal();
  if (typeof showToast === "function") showToast("Bundle added (demo)");
});
