/* NSBL · site script (plain JS, no libraries)
   1. Mobile menu.
   2. One light fade-in per section, once, the first time it enters the screen.
      No motion at all when the visitor prefers reduced motion. Without JS, everything is visible. */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn"), nav = document.querySelector(".nav");
  if (menuBtn && nav) menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.classList.toggle("menu-open", open);
  });

  /* ---------- Tree slider: swipe (native), arrow buttons, dots, ← → keys ---------- */
  [].forEach.call(document.querySelectorAll(".slider"), function (slider) {
    var track = slider.querySelector(".slider__track");
    var slides = [].slice.call(track.children);
    var dots = [].slice.call(slider.querySelectorAll(".slider__dots button"));
    var prev = slider.querySelector('[data-dir="-1"]'), next = slider.querySelector('[data-dir="1"]');
    var current = 0;

    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft });
    }
    function update() {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      current = i;
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
      prev.disabled = i === 0; next.disabled = i === slides.length - 1;
    }
    prev.addEventListener("click", function () { go(current - 1); });
    next.addEventListener("click", function () { go(current + 1); });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); }); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });

    // ← → work whenever the slider is on screen (handy when presenting), unless typing in a field.
    var visible = false;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].intersectionRatio > 0.5; }, { threshold: [0, 0.5, 1] }).observe(track);
    document.addEventListener("keydown", function (e) {
      if (!visible || /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
    });
    update();
  });

  /* ---------- Section fade-in ---------- */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) return;

  var sections = [].slice.call(document.querySelectorAll("main > section, .site-footer"));
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  sections.forEach(function (s) {
    // Sections already on screen at load stay still; only the ones below get the fade.
    if (s.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    s.classList.add("fade");
    io.observe(s);
  });
})();
