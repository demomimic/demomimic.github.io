// Gallery behavior: tab switching, hover-to-play, 2x playback.
document.addEventListener('DOMContentLoaded', function () {
  const PLAYBACK = 2; // all rollout clips play at 2x

  // ---- Enhance every card video: poster image by default, video on hover, 2x + badge ----
  document.querySelectorAll('.card .media').forEach(function (media) {
    const video = media.querySelector('video');
    if (!video) return;

    // Prefer a trimmed copy in static/videos_trim/ if one exists (originals untouched).
    const source = video.querySelector('source');
    if (source) {
      const orig = source.getAttribute('src');
      const trim = orig.replace('static/videos/', 'static/videos_trim/');
      if (trim !== orig) {
        fetch(trim, { method: 'HEAD' }).then(function (res) {
          if (!res.ok) return;
          source.setAttribute('src', trim);
          video.load();
          video.playbackRate = PLAYBACK;
        }).catch(function () {});
      }
    }

    video.removeAttribute('autoplay');
    video.loop = true;
    video.muted = true;
    video.setAttribute('muted', '');
    video.preload = 'metadata';
    video.playbackRate = PLAYBACK;

    // Static poster image of the object, shown until hover.
    const posterSrc = video.getAttribute('poster');
    if (posterSrc) {
      const img = document.createElement('img');
      img.className = 'poster';
      img.src = posterSrc;
      img.alt = '';
      media.insertBefore(img, video);
    }

    // "2×" speed badge.
    const badge = document.createElement('span');
    badge.className = 'rate-badge';
    badge.textContent = '2×';
    media.appendChild(badge);

    const card = media.closest('.card');
    let hovering = false;
    const canHover = !(window.matchMedia && window.matchMedia('(hover: none)').matches);

    // Affordance hint — signals the poster is playable; fades out once the clip runs.
    const hint = document.createElement('span');
    hint.className = 'play-hint';
    hint.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
      'Tap to play';
    media.appendChild(hint);

    function startClip() {
      hovering = true;
      video.playbackRate = PLAYBACK;
      const p = video.play();
      if (p && p.catch) p.catch(function () {
        // not ready yet — force a load and try once more
        try { video.load(); } catch (e) {}
        if (hovering) { const p2 = video.play(); if (p2 && p2.catch) p2.catch(() => {}); }
      });
    }
    function stopClip() {
      hovering = false;
      video.pause();
      video.currentTime = 0;
    }

    // Only reveal the video once it is actually playing, so a paused frame
    // (and the browser's native play button) is never exposed.
    video.addEventListener('playing', function () {
      video.playbackRate = PLAYBACK;
      media.classList.add('playing');
      if (!hovering) { video.pause(); video.currentTime = 0; } // interaction ended mid-load
    });
    video.addEventListener('pause', function () { media.classList.remove('playing'); });

    if (canHover) {
      // Mouse / laptop: hover previews the clip, and a click also starts it
      // so the "Tap to play" affordance works on desktop too.
      card.addEventListener('mouseenter', startClip);
      card.addEventListener('mouseleave', stopClip);
      card.addEventListener('click', startClip);
    } else {
      // Touch / mobile: tap the card to toggle the rollout (no hover to conflict with).
      card.addEventListener('click', function () {
        if (video.paused) startClip(); else stopClip();
      });
    }
  });

  // ---- Table-of-contents scroll-spy ----
  const tocLinks = document.querySelectorAll('.toc-list a[data-sec]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const linkFor = {};
    tocLinks.forEach(a => { linkFor[a.dataset.sec] = a; });
    const setActive = (id) => tocLinks.forEach(a => a.classList.toggle('active', a.dataset.sec === id));
    const visible = new Set();
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(e => { if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id); });
      // pick the first section (in document order) currently in the active band
      const order = ['abstract', 'results', 'method', 'contact-rewards'];
      const current = order.find(id => visible.has(id));
      if (current) setActive(current);
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    ['abstract', 'results', 'method', 'contact-rewards'].forEach(id => {
      const s = document.getElementById(id); if (s) spy.observe(s);
    });
  }

  // ---- Reveal the method figure on scroll ----
  const methodFig = document.getElementById('methodFig');
  if (methodFig) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) { methodFig.classList.add('in'); io.disconnect(); } });
      }, { threshold: 0.2 });
      io.observe(methodFig);
    } else { methodFig.classList.add('in'); }
  }

  // ---- Task tab switching ----
  const tabs = document.querySelectorAll('.tab');
  const groups = document.querySelectorAll('.taskgroup');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.dataset.task;
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      groups.forEach(g => g.classList.toggle('active', g.dataset.task === target));

      // pause + reset videos in every group; hover starts them again
      groups.forEach(function (g) {
        g.querySelectorAll('video').forEach(function (v) { v.pause(); v.currentTime = 0; });
      });
    });
  });

  // Prime every card video on load so hover-to-play works on the initially-active
  // tab immediately. Without this, the first tab's clips only start on hover AFTER
  // a tab switch — because switching is what first forced the videos to load.
  function primeCardVideos() {
    document.querySelectorAll('.card .media video').forEach(function (v) {
      try {
        if (v.preload === 'none') v.preload = 'metadata';
        v.load();            // force the first frame / metadata to load now
      } catch (e) {}
    });
  }
  requestAnimationFrame(primeCardVideos);
  window.addEventListener('load', primeCardVideos);
});
