/* ==========================================================================
   Portfolio behavior layer — no dependencies.
   Respects prefers-reduced-motion and touch/coarse pointers throughout.
   ========================================================================== */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer  = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------- page veil (load reveal + link transitions) ---------------- */
  var veil = document.querySelector(".page-veil");
  function liftVeil(){
    if(!veil) return;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ veil.classList.add("is-lifted"); });
    });
  }
  if(reduceMotion && veil){ veil.style.display = "none"; }
  else { liftVeil(); }

  document.addEventListener("click", function(e){
    var link = e.target.closest("a");
    if(!link) return;
    var href = link.getAttribute("href");
    if(!href || href.charAt(0) === "#") return;
    if(link.target === "_blank" || link.hasAttribute("download")) return;
    if(/^https?:\/\//i.test(href) || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0 || href.indexOf("wa.me") !== -1) return;
    if(reduceMotion || !veil) return;
    e.preventDefault();
    veil.classList.remove("is-lifted");
    setTimeout(function(){ window.location.href = href; }, 560);
  });

  /* ---------------- header scroll behavior ---------------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var lastY = window.scrollY;

  function onScroll(){
    var y = window.scrollY;
    if(header){
      header.classList.toggle("is-scrolled", y > 40);
      if(y > lastY && y > 160){ header.classList.add("is-hidden"); }
      else { header.classList.remove("is-hidden"); }
    }
    if(progress){
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (y / max) * 100 : 0;
      progress.style.width = pct + "%";
    }
    lastY = y;
  }
  document.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  /* ---------------- mobile menu ---------------- */
  var toggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  if(toggle && mobileMenu){
    toggle.addEventListener("click", function(){
      var open = toggle.classList.toggle("is-open");
      mobileMenu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){
        toggle.classList.remove("is-open");
        mobileMenu.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------------- scroll reveal ---------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if(revealEls.length){
    if("IntersectionObserver" in window && !reduceMotion){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold:0.18, rootMargin:"0px 0px -40px 0px" });
      revealEls.forEach(function(el, i){
        var delay = el.getAttribute("data-delay");
        el.style.setProperty("--reveal-delay", (delay ? +delay : (i % 4) * 90) + "ms");
        io.observe(el);
      });
    } else {
      revealEls.forEach(function(el){ el.classList.add("is-visible"); });
    }
  }

  /* ---------------- hero canvas chips ---------------- */
  var canvas = document.querySelector(".hero-canvas, .case-cover .hero-canvas");
  if(canvas){
    setTimeout(function(){ canvas.classList.add("is-ready"); }, reduceMotion ? 0 : 500);
  }

  /* ---------------- count-up stats ---------------- */
  var counters = document.querySelectorAll("[data-count]");
  if(counters.length){
    var animate = function(el){
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var dur = reduceMotion ? 1 : 1400;
      var start = null;
      var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
      function step(ts){
        if(start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix;
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if("IntersectionObserver" in window){
      var cio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ animate(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold:0.4 });
      counters.forEach(function(el){ cio.observe(el); });
    } else {
      counters.forEach(animate);
    }
  }

  /* ---------------- testimonial slider ---------------- */
  var slides = document.querySelectorAll(".testimonial");
  var dots = document.querySelectorAll(".dot-btn");
  if(slides.length){
    var current = 0, timer;
    function show(i){
      slides.forEach(function(s,idx){ s.classList.toggle("is-active", idx === i); });
      dots.forEach(function(d,idx){ d.classList.toggle("is-active", idx === i); });
      current = i;
    }
    function next(){ show((current + 1) % slides.length); }
    function play(){ if(reduceMotion) return; timer = setInterval(next, 6000); }
    function stop(){ clearInterval(timer); }
    dots.forEach(function(d,idx){
      d.addEventListener("click", function(){ show(idx); stop(); play(); });
    });
    var wrap = document.querySelector(".testimonial-wrap");
    if(wrap){
      wrap.addEventListener("mouseenter", stop);
      wrap.addEventListener("mouseleave", play);
    }
    show(0);
    play();
  }

  /* ---------------- magnetic buttons ---------------- */
  if(finePointer && !reduceMotion){
    document.querySelectorAll(".magnetic").forEach(function(btn){
      btn.addEventListener("mousemove", function(e){
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) * 0.28;
        var y = (e.clientY - r.top - r.height/2) * 0.45;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("mouseleave", function(){ btn.style.transform = "translate(0,0)"; });
    });
  }

  /* ---------------- custom cursor ---------------- */
  if(finePointer){
    document.documentElement.classList.add("has-cursor");
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    var label = document.createElement("span");
    label.className = "cursor-label";
    ring.appendChild(label);
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    });
    function loop(){
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll("[data-cursor]").forEach(function(el){
      el.addEventListener("mouseenter", function(){
        ring.classList.add("is-active");
        label.textContent = el.getAttribute("data-cursor") || "";
      });
      el.addEventListener("mouseleave", function(){
        ring.classList.remove("is-active");
        label.textContent = "";
      });
    });
  }

  /* ---------------- case-study sticky nav highlight ---------------- */
  var caseNav = document.querySelectorAll(".case-nav a");
  if(caseNav.length){
    var targets = [];
    caseNav.forEach(function(a){
      var id = a.getAttribute("href").replace("#","");
      var el = document.getElementById(id);
      if(el) targets.push({ id:id, el:el, link:a });
    });
    if("IntersectionObserver" in window && targets.length){
      var nio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var match = targets.find(function(t){ return t.el === entry.target; });
          if(match && entry.isIntersecting){
            caseNav.forEach(function(a){ a.classList.remove("is-active"); });
            match.link.classList.add("is-active");
          }
        });
      }, { rootMargin: "-30% 0px -55% 0px", threshold:0.01 });
      targets.forEach(function(t){ nio.observe(t.el); });
    }
  }

})();
