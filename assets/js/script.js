(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  var nav = document.getElementById("nav");
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.getElementById("navLinks");
  var links = navLinks.querySelectorAll("a");
  var progress = document.getElementById("progress");

  // ---- Mobile menu
  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }
  menuBtn.addEventListener("click", function () { setMenu(!navLinks.classList.contains("open")); });
  links.forEach(function (l) { l.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 700) setMenu(false); });

  // ---- Nav shadow + scroll progress bar
  var ticking = false;
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 20);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // ---- Reveal on scroll
  var revealEls = document.querySelectorAll(".reveal");
  if (hasIO && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); ro.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      // small stagger for siblings inside grids
      var sibs = el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : [];
      if (sibs.length > 1) el.style.transitionDelay = Math.min(Array.prototype.indexOf.call(sibs, el), 5) * 70 + "ms";
      ro.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // ---- Active nav link
  var sections = document.querySelectorAll("main section[id]");
  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ---- Count-up stats
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    var suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = target + suffix; return; }
    var n = 0;
    var step = Math.max(120, Math.floor(900 / target));
    (function tick() { n++; el.textContent = n + suffix; if (n < target) setTimeout(tick, step); })();
  }
  if (hasIO) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.dataset.count + (c.dataset.suffix || ""); });
  }

  // ---- Spotlight glow follows the cursor on cards
  document.querySelectorAll(".spot").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - r.left + "px");
      el.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  // ---- Subtle 3D tilt on the hero card (fine pointers only)
  var tilt = document.querySelector(".tilt");
  if (tilt && !reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    tilt.addEventListener("pointermove", function (e) {
      var r = tilt.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = "perspective(900px) rotateY(" + x * 8 + "deg) rotateX(" + -y * 8 + "deg)";
    });
    tilt.addEventListener("pointerleave", function () { tilt.style.transform = ""; });
  }

  // ---- Copy email
  var copyBtn = document.getElementById("copyMail");
  var copyLabel = document.getElementById("copyLabel");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.dataset.email;
      var done = function () {
        copyBtn.classList.add("copied");
        copyLabel.textContent = "Copied to clipboard ✓";
        setTimeout(function () { copyBtn.classList.remove("copied"); copyLabel.textContent = email; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { window.location.href = "mailto:" + email; });
      } else {
        window.location.href = "mailto:" + email;
      }
    });
  }

  // ---- Footer year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
