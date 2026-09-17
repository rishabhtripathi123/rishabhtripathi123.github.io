(function () {
  "use strict";

  var root = document.documentElement;
  var THEME_KEY = "portfolio-theme";

  // ---------- Theme toggle ----------
  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function currentEffectiveTheme() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
  } catch (e) {}

  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentEffectiveTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  // ---------- Nav scroll shadow + mobile toggle ----------
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 8) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  });

  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { navLinks.classList.remove("open"); });
  });

  // ---------- Active nav link on scroll ----------
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id], header[id]"));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));

  function updateActiveNav() {
    var scrollPos = window.scrollY + 140;
    var currentId = sections.length ? sections[0].id : null;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navAnchors.forEach(function (a) {
      var isActive = a.getAttribute("href") === "#" + currentId;
      a.classList.toggle("active", isActive);
    });
  }
  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav();

  // ---------- Reveal on scroll ----------
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- Animated counters ----------
  var counters = document.querySelectorAll(".counter");
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1200;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var counterIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { counterIo.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = (el.getAttribute("data-target") || "0") + (el.getAttribute("data-suffix") || "");
    });
  }

  // ---------- Experience tab switcher ----------
  var expTabs = document.querySelectorAll(".exp-tab");
  var expPanels = document.querySelectorAll(".exp-panel");
  expTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var key = tab.getAttribute("data-exp");
      expTabs.forEach(function (t) { t.classList.toggle("active", t === tab); });
      expPanels.forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-exp") === key); });
    });
  });

  // ---------- Skill filters ----------
  var filterButtons = document.querySelectorAll(".skill-filter");
  var skillChips = document.querySelectorAll(".skill-chip");
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");
      skillChips.forEach(function (chip) {
        var cat = chip.getAttribute("data-cat");
        if (filter === "all") {
          chip.classList.remove("dim");
          chip.classList.remove("hl");
        } else if (cat === filter) {
          chip.classList.remove("dim");
          chip.classList.add("hl");
        } else {
          chip.classList.add("dim");
          chip.classList.remove("hl");
        }
      });
    });
  });

  // ---------- Lightbox gallery ----------
  var lightbox = document.getElementById("lightbox");
  var lbImage = document.getElementById("lbImage");
  var lbCaption = document.getElementById("lbCaption");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var currentGallery = [];
  var currentIndex = 0;

  function openLightbox(galleryImgs, index) {
    currentGallery = galleryImgs;
    currentIndex = index;
    showLightboxImage();
    lightbox.classList.add("open");
  }
  function showLightboxImage() {
    var img = currentGallery[currentIndex];
    lbImage.src = img.getAttribute("src");
    lbImage.alt = img.getAttribute("alt") || "";
    lbCaption.textContent = img.getAttribute("alt") || "";
    lbPrev.style.display = currentGallery.length > 1 ? "flex" : "none";
    lbNext.style.display = currentGallery.length > 1 ? "flex" : "none";
  }
  function closeLightbox() { lightbox.classList.remove("open"); }

  document.querySelectorAll(".photo-strip").forEach(function (strip) {
    var imgs = Array.prototype.slice.call(strip.querySelectorAll("img"));
    imgs.forEach(function (img, i) {
      img.addEventListener("click", function () { openLightbox(imgs, i); });
    });
  });

  lbClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
  lbPrev.addEventListener("click", function () {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    showLightboxImage();
  });
  lbNext.addEventListener("click", function () {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    showLightboxImage();
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lbPrev.click();
    if (e.key === "ArrowRight") lbNext.click();
  });

  // ---------- Footer year ----------
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
