/* NSBL · Home — "scroll = dig"
   Each chapter: you arrive above ground, the camera sinks below the soil line,
   the earth clears away and the roots show what the plant keeps for us. */
(function () {
  "use strict";
  var NSBL = window.NSBL || {}, $ = NSBL.$, $$ = NSBL.$$;
  if (typeof window.gsap === "undefined") return;
  var REDUCED = NSBL.reduced;

  /* ---------- Loader: wait for the plates, count to 100 ---------- */
  var loader = $(".loader"), countEl = $(".loader__count"), barEl = $(".loader__bar i");
  var imgs = $$("img[data-preload]");
  var loaded = 0, shown = { v: 0 };
  function bump() {
    loaded++;
    gsap.to(shown, { v: loaded / imgs.length * 100, duration: .6, ease: "power2.out", overwrite: true, onUpdate: function () {
      countEl.textContent = Math.round(shown.v); gsap.set(barEl, { scaleX: shown.v / 100 });
    }, onComplete: function () { if (loaded >= imgs.length) start(); } });
  }
  imgs.forEach(function (img) {
    if (img.complete && img.naturalWidth) bump();
    else { img.addEventListener("load", bump, { once: true }); img.addEventListener("error", bump, { once: true }); }
  });
  var started = false;
  setTimeout(function () { start(); }, 6000); // never hang a live demo
  if (!imgs.length) start();

  function start() {
    if (started) return; started = true;
    gsap.set(".curtain", { autoAlpha: 0 });   // the loader is this page's entrance
    build();
    var heroLines = NSBL.splitLines($(".dig--hero .hero-title"));
    var tl = gsap.timeline();
    if (REDUCED) { gsap.set(loader, { autoAlpha: 0 }); return; }
    gsap.set(heroLines, { yPercent: 115 });
    gsap.set([".dig--hero .dig__above .kicker", ".dig--hero .ar", ".hero__cue", ".site-header"], { autoAlpha: 0, y: 20 });
    tl.to(".loader__inner", { autoAlpha: 0, y: -20, duration: .5, ease: "power2.in" })
      .to(loader, { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=.05")
      .fromTo(".dig--hero .dig__plate", { scale: 1.18 }, { scale: 1, duration: 2.4, ease: "expo.out" }, "<.15")
      .to(heroLines, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: .1 }, "-=1.7")
      .to([".dig--hero .dig__above .kicker", ".dig--hero .ar"], { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: .1 }, "-=1.1")
      .to([".site-header", ".hero__cue"], { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out" }, "-=.8")
      .set(loader, { display: "none" });
  }

  /* ---------- Build all scroll scenes ---------- */
  function build() {
    NSBL.initReveals();
    if (REDUCED) { setupReduced(); return; }

    var digs = $$(".dig");
    digs.forEach(function (sec, i) { digScene(sec, i); });
    seedScene($(".seed-ch"));
    railScene($(".rail"));
    depthAndIndex(digs);

    // CTA parallax
    gsap.fromTo(".cta__bg", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });
    ScrollTrigger.refresh();
  }

  function digScene(sec, i) {
    var plate = $(".dig__plate", sec), earth = $(".dig__earth", sec), glow = $(".dig__glow", sec);
    var above = $(".dig__above", sec), below = $(".dig__below", sec);
    var soil = parseFloat(sec.getAttribute("data-soil"));        // soil line, fraction of plate height
    var focus = parseFloat(sec.getAttribute("data-focus"));      // centre of roots, fraction of plate height
    var isHero = sec.classList.contains("dig--hero");

    var belowLines = NSBL.splitLines($(".d-xl", below));
    gsap.set(belowLines, { yPercent: 115 });
    gsap.set($(".kicker", below), { autoAlpha: 0 });
    var aboveLines = [];
    if (!isHero) { aboveLines = NSBL.splitLines($(".d-xl", above)); gsap.set(aboveLines, { yPercent: 115 }); gsap.set($(".kicker", above), { autoAlpha: 0 }); }

    // geometry (recomputed on refresh)
    var g = {};
    function measure() {
      var vh = window.innerHeight, ph = plate.offsetWidth;            // plate is square
      g.vh = vh; g.ph = ph;
      g.y0 = Math.min(0, vh * .7 - soil * ph);                        // soil line at ~70% of the screen
      g.y1 = Math.max(vh - ph, -(focus * ph - vh * .5));             // roots centred, never past the bottom edge
      earth.style.top = (soil * ph) + "px";
      earth.style.setProperty("--my", ((focus - soil) / (1 - soil) * 100) + "%");
      g.rMax = Math.hypot(plate.offsetWidth, (1 - soil) * ph) * .75;
      g.feather = Math.max(120, ph * .09);
      earth.style.setProperty("--feather", g.feather + "px");
    }
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);

    var hole = { r: 0 };
    function setHole() { earth.style.setProperty("--r", (hole.r * g.rMax - g.feather) + "px"); }
    setHole();

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: sec, start: "top top", end: "+=260%", pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true }
    });
    gsap.set(plate, { y: function () { return g.y0; } });

    // 1 · arrive above ground
    if (!isHero) {
      tl.to(aboveLines, { yPercent: 0, duration: .12, ease: "power3.out", stagger: .02 }, 0)
        .to($(".kicker", above), { autoAlpha: 1, duration: .08 }, 0);
    }
    tl.to({}, { duration: .1 });
    // 2 · sink below the soil line
    tl.to(above, { autoAlpha: 0, y: -80, duration: .18, ease: "power2.in" }, .2)
      .fromTo(plate, { y: function () { return g.y0; } }, { y: function () { return g.y1; }, duration: .45, ease: "power1.inOut", immediateRender: false }, .22)
      .to(hole, { r: 1, duration: .42, ease: "power2.in", onUpdate: setHole }, .32)
      .to(glow, { autoAlpha: 1, duration: .3 }, .45)
      .to(plate, { scale: 1.06, duration: .5 }, .3);
    if (isHero) tl.to(".hero__cue", { autoAlpha: 0, duration: .05 }, .1);
    // 3 · what the roots keep
    tl.to($(".kicker", below), { autoAlpha: 1, duration: .06 }, .7)
      .to(belowLines, { yPercent: 0, duration: .14, ease: "power3.out", stagger: .03 }, .7)
      .to($(".dig__shade", sec), { autoAlpha: 1, duration: .12 }, .66)
      .to({}, { duration: .14 });
    // 4 · fall away to the next chapter
    tl.to(sec.querySelector(".dig__stage"), { autoAlpha: .25, duration: .1 }, .92)
      .to(below, { autoAlpha: 0, y: -40, duration: .08 }, .92);
  }

  function seedScene(sec) {
    if (!sec) return;
    var svg = $(".seed-ch__svg", sec), tips = $$(".seed-ch__tips span", sec);
    var seed = { x: 50, y: 21 };
    // tip positions (percent of the stage); the labels sit on them. Kept above the headline.
    var P = [[18, 45], [31, 52], [44, 42], [57, 48], [70, 52], [83, 43]];
    var paths = [], fine = [];
    var W = window.innerWidth, H = window.innerHeight;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function X(p) { return p / 100 * W; } function Y(p) { return p / 100 * H; }
    function curve(x0, y0, x1, y1, wig) {
      var c1x = x0 + (x1 - x0) * .12 + rnd(-wig, wig), c1y = y0 + (y1 - y0) * .6;
      var c2x = x0 + (x1 - x0) * .7 + rnd(-wig, wig), c2y = y0 + (y1 - y0) * .55 + rnd(-wig, wig) * .4;
      return "M" + x0 + " " + y0 + " C" + c1x + " " + c1y + " " + c2x + " " + c2y + " " + x1 + " " + y1;
    }
    var ns = "http://www.w3.org/2000/svg";
    var sx0 = X(seed.x), sy0 = Y(seed.y) + Math.min(W, H) * .07;
    P.forEach(function (p, i) {
      var main = document.createElementNS(ns, "path");
      main.setAttribute("d", curve(sx0 + rnd(-6, 6), sy0, X(p[0]), Y(p[1]), 40));
      main.style.strokeWidth = "1.6px";
      svg.appendChild(main); paths.push(main);
      for (var k = 0; k < 3; k++) {          // rootlets
        var len = main.getTotalLength(), pt = main.getPointAtLength(len * rnd(.35, .85));
        var r = document.createElementNS(ns, "path");
        r.setAttribute("d", curve(pt.x, pt.y, pt.x + rnd(-70, 70), pt.y + rnd(30, 80), 14));
        r.style.strokeWidth = ".8px"; r.style.opacity = ".5";
        svg.appendChild(r); fine.push({ el: r, at: i });
      }
      tips[i].style.left = p[0] + "%"; tips[i].style.top = p[1] + "%";
    });
    paths.concat(fine.map(function (f) { return f.el; })).forEach(function (p) {
      var L = p.getTotalLength(); p.style.strokeDasharray = L + " " + L; p.style.strokeDashoffset = L;
    });
    var copyLines = NSBL.splitLines($(".seed-ch__copy .d-xl", sec));
    gsap.set(copyLines, { yPercent: 115 });
    gsap.set([$(".seed-ch__copy .lead", sec), $(".seed-ch__copy .kicker", sec)], { autoAlpha: 0, y: 20 });
    gsap.set(tips, { autoAlpha: 0, y: 10 });

    var tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "+=200%", pin: true, scrub: 1, anticipatePin: 1 } });
    tl.fromTo(".seed-ch__seed", { scale: .4, autoAlpha: 0, rotate: -30 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: .2, ease: "power2.out" }, 0)
      .to(paths, { strokeDashoffset: 0, duration: .4, stagger: .03 }, .15)
      .to(fine.map(function (f) { return f.el; }), { strokeDashoffset: 0, duration: .25, stagger: .01 }, .3)
      .to(tips, { autoAlpha: 1, y: 0, duration: .08, stagger: .04 }, .45)
      .to($(".seed-ch__copy .kicker", sec), { autoAlpha: 1, y: 0, duration: .08 }, .62)
      .to(copyLines, { yPercent: 0, duration: .14, ease: "power3.out", stagger: .03 }, .64)
      .to($(".seed-ch__copy .lead", sec), { autoAlpha: 1, y: 0, duration: .1 }, .74)
      .to([svg, ".seed-ch__tips"], { opacity: .45, duration: .12 }, .62)
      .to({}, { duration: .16 });
  }

  function railScene(sec) {
    if (!sec) return;
    var track = $(".rail__track", sec);
    if (window.innerWidth < 860) return;          // native swipe on small screens
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    gsap.to(track, { x: function () { return -dist(); }, ease: "none",
      scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    $$(".seed-card__img img", sec).forEach(function (img, i) {
      gsap.fromTo(img, { rotate: -20 + i * 6 }, { rotate: 20 - i * 6, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + dist(); }, scrub: true } });
    });
  }

  /* ---------- Depth gauge + chapter index + demo keys ---------- */
  function depthAndIndex(digs) {
    var depth = $(".depth"), val = $(".depth__val"), dot = $(".depth__track i"), idx = $(".chapters");
    var first = digs[0], last = $(".seed-ch");
    var MAX = 2.4; // metres — a story scale, not a measurement
    ScrollTrigger.create({
      trigger: first, start: "top top", endTrigger: last, end: "bottom top",
      onUpdate: function (self) {
        var p = self.progress;
        val.textContent = "−" + (p * MAX).toFixed(2);
        gsap.set(dot, { y: p * ($(".depth__track").offsetHeight - 7) });
        if (NSBL.soundDepth) NSBL.soundDepth(p);
      },
      onToggle: function (self) { gsap.to([depth, idx], { autoAlpha: self.isActive ? 1 : 0, duration: .5 }); }
    });
    var targets = digs.concat([last]);
    var links = $$(".chapters a");
    function pinOf(t) { return ScrollTrigger.getAll().filter(function (s) { return s.trigger === t && s.pin; })[0]; }
    var current = -1;
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (self) {
      var y = self.scroll() + window.innerHeight * .4, idx = 0;
      targets.forEach(function (t, i) { var st = pinOf(t); if (st && y >= st.start) idx = i; });
      if (idx !== current) { current = idx; links.forEach(function (l, j) { l.classList.toggle("is-active", j === idx); }); }
    } });
    function jump(i) {
      var t = targets[i]; if (!t) return;
      var st = pinOf(t);
      NSBL.scrollTo(st ? st.start + 2 : t, { duration: 2.2 });
    }
    links.forEach(function (l, i) { l.addEventListener("click", function (e) { e.preventDefault(); jump(i); }); });
    // Presenter keys: 1–4 jump to a chapter, 5 the seeds, 0 back to the surface
    window.addEventListener("keydown", function (e) {
      if (e.target.closest && e.target.closest("input, textarea, select")) return;
      if (e.key >= "1" && e.key <= "4") jump(+e.key - 1);
      else if (e.key === "5") NSBL.scrollTo(".rail", { duration: 2.2 });
      else if (e.key === "0") NSBL.scrollTo(0, { duration: 2.4 });
    });
  }

  function setupReduced() {
    gsap.set(".loader", { display: "none" });
    $$(".dig__earth").forEach(function (e) { e.style.display = "none"; });
  }
})();
