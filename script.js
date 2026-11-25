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

  /* ---------------- editorial hero: word-by-word scroll highlight ---------------- */
  var heroHL = document.querySelector('.hero-intro');
  if(heroHL){
    var hWords = heroHL.querySelectorAll('.hw');
    function setLit(n){ hWords.forEach(function(w, i){ w.classList.toggle('lit', i < n); }); }
    if(reduceMotion){ setLit(hWords.length); }
    else {
      function tickHL(){
        var rect = heroHL.getBoundingClientRect();
        var start = window.innerHeight * .78;
        var travel = Math.max(rect.height * 1.45, window.innerHeight * .9);
        var progress = Math.max(0, Math.min(1, (start - rect.top) / travel));
        var count = Math.max(1, Math.ceil(progress * hWords.length));
        setLit(count);
      }
      document.addEventListener('scroll', tickHL, { passive:true });
      window.addEventListener('resize', tickHL, { passive:true });
      tickHL();
    }
  }

  /* ---------------- about story: one chapter becomes active per scroll ---------------- */
  var aboutPanels = document.querySelectorAll("[data-about-panel]");
  var aboutCurrent = document.querySelector(".about-rail-current");
  if(aboutPanels.length && "IntersectionObserver" in window){
    var aboutIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          aboutPanels.forEach(function(panel){ panel.classList.toggle("is-current", panel === entry.target); });
          var idx = Array.prototype.indexOf.call(aboutPanels, entry.target) + 1;
          if(aboutCurrent) aboutCurrent.innerHTML = ("0" + idx).slice(-2) + " <i>—</i> 03";
        }
      });
    }, { rootMargin:"-38% 0px -38% 0px", threshold:0 });
    aboutPanels.forEach(function(panel){ aboutIO.observe(panel); });
  }

  /* ---------------- career path: animate milestones as they enter ---------------- */
  var careerJourney = document.querySelector(".career-journey");
  var careerStops = document.querySelectorAll(".career-stop");
  if(careerJourney && "IntersectionObserver" in window && !reduceMotion){
    var careerIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold:0.22, rootMargin:"0px 0px -8% 0px" });
    careerStops.forEach(function(stop){ careerIO.observe(stop); });
    var careerLineIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ careerJourney.classList.toggle("is-active", entry.isIntersecting); });
    }, { threshold:0.05 });
    careerLineIO.observe(careerJourney);
  } else {
    careerStops.forEach(function(stop){ stop.classList.add("is-visible"); });
    if(careerJourney) careerJourney.classList.add("is-active");
  }

  /* ---------------- hutterite password modal ---------------- */
  var hutCard = document.getElementById('hutteriteCard');
  var pwModal = document.getElementById('pwModal');
  if(hutCard && pwModal){
    var pwInput  = document.getElementById('pwInput');
    var pwError  = document.getElementById('pwError');
    var pwSubmit = document.getElementById('pwSubmit');
    var pwClose  = pwModal.querySelector('.pw-close');
    var pwBack   = pwModal.querySelector('.pw-backdrop');
    function openPW(){
      pwModal.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      setTimeout(function(){ if(pwInput) pwInput.focus(); }, 80);
    }
    function closePW(){
      pwModal.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
      if(pwInput){ pwInput.value=''; pwInput.classList.remove('is-error'); }
      if(pwError) pwError.textContent='';
    }
    // Password gate switch: data-locked="true" on #hutteriteCard (index.html) = ask for the password.
    function goHut(){
      if(hutCard.getAttribute('data-locked') === 'true'){ openPW(); return; }
      if(veil && !reduceMotion){
        veil.classList.remove('is-lifted');
        setTimeout(function(){ window.location.href = 'hutterite-case-study.html'; }, 560);
      } else {
        window.location.href = 'hutterite-case-study.html';
      }
    }
    hutCard.addEventListener('click', function(e){
      if(e.target.closest('.hut-visit')) return;   // live-site link opens normally, no password
      e.preventDefault(); goHut();
    });
    hutCard.addEventListener('keydown', function(e){
      if(e.target !== hutCard) return;
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); goHut(); }
    });
    if(pwClose) pwClose.addEventListener('click', closePW);
    if(pwBack)  pwBack.addEventListener('click', closePW);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closePW(); });
    function tryPassword(){
      if(!pwInput) return;
      if(pwInput.value.trim() === 'Hut'){
        closePW();
        window.location.href = 'hutterite-case-study.html';
      } else {
        pwError.textContent = 'Incorrect password — please try again.';
        pwInput.classList.add('is-error');
        pwInput.value = '';
        pwInput.focus();
      }
    }
    if(pwSubmit) pwSubmit.addEventListener('click', tryPassword);
    if(pwInput)  pwInput.addEventListener('keydown', function(e){
      if(e.key==='Enter') tryPassword();
      else { pwInput.classList.remove('is-error'); pwError.textContent=''; }
    });
  }

  /* ---------------- scale neon-card visuals to their card width ---------------- */
  var nvVisuals = document.querySelectorAll('.neon-visual');
  if(nvVisuals.length){
    var NV_W = 567, NV_H = 290;
    var nvFit = function(v){
      var w = v.clientWidth; if(!w) return;
      var sc = Math.min(1, w / NV_W);
      v.style.setProperty('--nv-s', sc.toFixed(4));
      v.style.setProperty('--nv-h', Math.round(NV_H * sc) + 'px');
      v.style.setProperty('--nv-x', Math.round((w - NV_W * sc) / 2) + 'px');
    };
    nvVisuals.forEach(nvFit);
    if('ResizeObserver' in window){
      var nvRO = new ResizeObserver(function(entries){ entries.forEach(function(en){ nvFit(en.target); }); });
      nvVisuals.forEach(function(v){ nvRO.observe(v); });
    } else {
      window.addEventListener('resize', function(){ nvVisuals.forEach(nvFit); });
    }
  }

  /* ---------------- work gallery filters (service pages) ---------------- */
  document.querySelectorAll('[data-filter-group]').forEach(function(group){
    var scope = document.querySelector(group.getAttribute('data-filter-group'));
    if(!scope) return;
    var btns = group.querySelectorAll('[data-filter]');
    var items = scope.querySelectorAll('[data-cat]');
    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        var f = btn.getAttribute('data-filter');
        btns.forEach(function(b){
          var on = (b === btn);
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        items.forEach(function(it){
          var show = (f === 'all' || it.getAttribute('data-cat') === f);
          it.classList.toggle('is-hidden', !show);
        });
        scope.classList.toggle('is-filtered', f !== 'all');
      });
    });
  });

  /* ---------------- floating services dock ---------------- */
  var floatNav = document.querySelector('.float-nav');
  if(floatNav){
    setTimeout(function(){ floatNav.classList.add('is-in'); }, reduceMotion ? 0 : 1400);
    var dockFooter = document.querySelector('.footer');
    if(dockFooter && 'IntersectionObserver' in window){
      new IntersectionObserver(function(entries){
        entries.forEach(function(en){ floatNav.classList.toggle('is-away', en.isIntersecting); });
      }, { threshold:0.05 }).observe(dockFooter);
    }
  }

  /* ---------------- skills: hover or tap to reveal ---------------- */
  var skillsStage = document.getElementById('skillsStage');
  var skillsTrigger = document.getElementById('skillsTrigger');
  if(skillsStage && skillsTrigger){
    var skillsOpenedAt = 0;
    skillsStage.classList.add('is-armed');            // without JS the cards simply stay visible
    var setSkills = function(open){
      skillsStage.classList.toggle('is-open', open);
      skillsTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open) skillsOpenedAt = Date.now();
    };
    // hovering opens it (and it stays open while you read)
    skillsTrigger.addEventListener('mouseenter', function(){
      if(!skillsStage.classList.contains('is-open')) setSkills(true);
    });
    // click / tap / Enter: opens, or hides again (ignored for 0.7s after opening so hover+click doesn't flip it shut)
    skillsTrigger.addEventListener('click', function(){
      if(!skillsStage.classList.contains('is-open')) setSkills(true);
      else if(Date.now() - skillsOpenedAt > 700) setSkills(false);
    });
  }


  /* ---------------- day / night appearance ---------------- */
  var themeToggle = document.getElementById('themeToggle');
  var rootEl = document.documentElement;
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('portfolio-theme'); } catch(e) {}
  if(savedTheme === 'dark' || savedTheme === 'light') rootEl.setAttribute('data-theme', savedTheme);
  function updateThemeButton(){
    if(!themeToggle) return;
    var dark = rootEl.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.setAttribute('title', dark ? 'Switch to day mode' : 'Switch to night mode');
  }
  updateThemeButton();
  if(themeToggle){
    themeToggle.addEventListener('click', function(){
      var next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      rootEl.setAttribute('data-theme', next);
      try { localStorage.setItem('portfolio-theme', next); } catch(e) {}
      updateThemeButton();
    });
  }

  /* ---------------- optional tiny interface sound effects ---------------- */
  var soundToggle = document.getElementById('soundToggle');
  var soundOn = true;
  var audioContext = null;
  function syncSoundButton(){
    if(!soundToggle) return;
    soundToggle.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    soundToggle.setAttribute('aria-label', soundOn ? 'Disable interface sounds' : 'Enable interface sounds');
    soundToggle.setAttribute('title', soundOn ? 'Interface sounds on' : 'Interface sounds off');
  }
  function playUiTone(kind){
    if(!soundOn) return;
    try{
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      if(!audioContext) audioContext = new AC();
      if(audioContext.state === 'suspended') audioContext.resume();
      var now = audioContext.currentTime;
      var isClick = kind === 'click';
      var osc = audioContext.createOscillator();
      var gain = audioContext.createGain();
      var filter = audioContext.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isClick ? 740 : 560, now);
      osc.frequency.exponentialRampToValueAtTime(isClick ? 520 : 430, now + (isClick ? .085 : .11));
      filter.type = 'lowpass'; filter.frequency.setValueAtTime(1800, now);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(isClick ? .038 : .018, now + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + (isClick ? .12 : .14));
      osc.connect(filter); filter.connect(gain); gain.connect(audioContext.destination);
      osc.start(now); osc.stop(now + .15);
    }catch(e){}
  }
  syncSoundButton();
  if(soundToggle){
    soundToggle.addEventListener('click', function(){
      soundOn = !soundOn;
      syncSoundButton();
      if(soundOn) playUiTone('click');
    });
  }
  var soundTargets = '.neon-card,.project-card,.gallery-project,.gallery-project-captions a,.feature-card,.btn,.cta-banner a,.float-cta,.skills-trigger,.dot-btn';
  document.addEventListener('pointerover', function(e){
    if(!soundOn || e.pointerType === 'touch') return;
    var target = e.target.closest(soundTargets);
    if(target && !target.contains(e.relatedTarget)) playUiTone('hover');
  }, {passive:true});
  document.addEventListener('click', function(e){
    if(!soundOn) return;
    if(e.target.closest(soundTargets)) playUiTone('click');
  }, true);

  /* ---------------- user-controlled original ambient music player ---------------- */
  var player = document.getElementById('ambientPlayer');
  var musicAudio = document.getElementById('portfolioAudio');
  if(player && musicAudio){
    var expandBtn = document.getElementById('musicExpand');
    var panel = document.getElementById('musicPanel');
    var closeBtn = document.getElementById('musicClose');
    var playBtn = document.getElementById('musicPlay');
    var nextBtn = document.getElementById('musicNext');
    var volume = document.getElementById('musicVolume');
    var nameEl = document.getElementById('musicTrackName');
    var trackBtns = Array.prototype.slice.call(player.querySelectorAll('[data-track]'));
    var musicTracks = [
      {name:'Quiet Morning', src:'audio/track-1.mp3'},
      {name:'Soft Focus', src:'audio/track-2.mp3'},
      {name:'Slow Sunday', src:'audio/track-3.mp3'}
    ];
    var activeTrack = 0;
    musicAudio.volume = volume ? Number(volume.value) : .35;
    musicAudio.src = musicTracks[0].src;
    function openMusic(open){
      panel.hidden = !open;
      expandBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if(open) expandBtn.setAttribute('aria-label','Close portfolio music player');
      else expandBtn.setAttribute('aria-label','Open portfolio music player');
    }
    function selectTrack(index, autoplay){
      activeTrack = (index + musicTracks.length) % musicTracks.length;
      musicAudio.src = musicTracks[activeTrack].src;
      nameEl.textContent = musicTracks[activeTrack].name;
      trackBtns.forEach(function(btn,i){
        btn.classList.toggle('is-active', i === activeTrack);
        btn.setAttribute('aria-pressed', i === activeTrack ? 'true' : 'false');
      });
      if(autoplay) musicAudio.play().then(syncMusic).catch(syncMusic);
      else syncMusic();
    }
    function syncMusic(){
      var playing = !musicAudio.paused;
      player.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
      playBtn.querySelector('.play-glyph').textContent = playing ? 'Ⅱ' : '▶';
    }
    expandBtn.addEventListener('click', function(){ openMusic(panel.hidden); });
    closeBtn.addEventListener('click', function(){ openMusic(false); });
    playBtn.addEventListener('click', function(){
      if(musicAudio.paused) musicAudio.play().then(syncMusic).catch(syncMusic);
      else { musicAudio.pause(); syncMusic(); }
    });
    nextBtn.addEventListener('click', function(){ selectTrack(activeTrack + 1, !musicAudio.paused); });
    trackBtns.forEach(function(btn){
      btn.addEventListener('click', function(){ selectTrack(Number(btn.getAttribute('data-track')), !musicAudio.paused); });
    });
    if(volume) volume.addEventListener('input', function(){ musicAudio.volume = Number(volume.value); });
    musicAudio.addEventListener('play', syncMusic);
    musicAudio.addEventListener('pause', syncMusic);
    musicAudio.addEventListener('ended', syncMusic);
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !panel.hidden) openMusic(false); });
    syncMusic();
  }

})();
/* Floating gallery carousel controls */
(function(){
  var wrap=document.querySelector('[data-gallery-carousel]'); if(!wrap)return;
  var track=wrap.querySelector('[data-gallery-track]'),slides=[].slice.call(track.querySelectorAll('.gallery-project'));
  var labels=[].slice.call(wrap.querySelectorAll('.gallery-project-captions>span'));
  var current=wrap.querySelector('[data-gallery-current]'),progress=wrap.querySelector('[data-gallery-progress]');
  var index=0,timer;
  function activate(i,scroll){
    index=Math.max(0,Math.min(slides.length-1,i));
    slides.forEach(function(s,n){s.classList.toggle('is-active',n===index)});
    labels.forEach(function(s,n){s.classList.toggle('is-active',n===index)});
    if(current)current.textContent=String(index+1).padStart(2,'0');
    if(progress)progress.style.width=((index+1)/slides.length*100)+'%';
    if(scroll){var s=slides[index];track.scrollTo({left:s.offsetLeft-(track.clientWidth-s.clientWidth)/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
  }
  wrap.querySelector('[data-gallery-prev]').addEventListener('click',function(){activate((index-1+slides.length)%slides.length,true)});
  wrap.querySelector('[data-gallery-next]').addEventListener('click',function(){activate((index+1)%slides.length,true)});
  slides.forEach(function(s,i){s.addEventListener('focus',function(){activate(i,false)});s.addEventListener('mouseenter',function(){activate(i,false)})});
  track.addEventListener('scroll',function(){clearTimeout(timer);timer=setTimeout(function(){var c=track.scrollLeft+track.clientWidth/2,best=0,d=Infinity;slides.forEach(function(s,i){var x=Math.abs(s.offsetLeft+s.clientWidth/2-c);if(x<d){d=x;best=i}});activate(best,false)},70)},{passive:true});
  activate(0,false);
})();
