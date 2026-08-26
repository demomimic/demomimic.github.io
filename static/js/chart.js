// Per-task animated success-rate bar chart (one small chart beside each task's videos).
// Bars grow + count up when the task becomes visible. Object pictures under bars, no names.
(function () {
  const MAX = 100;
  const TICKS = [0, 25, 50, 75, 100];
  const IC = 'static/images/icons/';

  // Ordered to match each task's video cards (left-to-right / grid order).
  const DATA = {
    openbox: { items: [
      { name: 'Wooden Box',      v: 82.74, icon: 'wooden_box_icon.png' },
      { name: 'Toolbox',         v: 87.33, icon: 'toolbox_icon.png' },
      { name: 'Robot Hand Box',  v: 39.39, icon: 'robot_box_icon.png' },
      { name: 'Shoe Box',        v: 77.69, icon: 'shoebox_icon.png' },
    ]},
    liftlid: { items: [
      { name: 'Finemade Waffleiron', v: 57.36, icon: 'finemade_waffleiron_icon.png' },
      { name: 'Gourima Waffleiron',  v: 44.82, icon: 'gourima_waffleiorn_icon.png' },
      { name: 'Breakfast Maker',     v: 64.35, icon: 'sandwich_maker_icon.png' },
    ]},
    movebottle: { items: [
      { name: 'Sunscreen',         v: 93.75, icon: 'sunscreen.png' },
      { name: 'Souvenir Cup',      v: 75,    icon: 'souvenir_cup.png' },
      { name: 'Canned Drink',      v: 73.75, icon: 'canned_drink.png' },
      { name: 'Water Bottle',      v: 78.75, icon: 'water_bottle.png' },
      { name: 'Vitamin Container', v: 86.25, icon: 'vitamin_container.png' },
    ]},
  };

  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const pct = v => (v / MAX * 100);

  function build(root, task) {
    const d = DATA[task];
    root.classList.add('mo', 'mini');
    root.textContent = '';

    root.appendChild(el('div', 'mo-title', 'Real-world success rate'));
    root.appendChild(el('div', 'mo-note', '20 rollouts per object'));

    const body = el('div', 'mo-body');

    // value axis
    const axiscol = el('div', 'mo-axiscol');
    const axis = el('div', 'mo-axis');
    TICKS.forEach(t => { const l = el('div', 'mo-tick', String(t)); l.style.bottom = pct(t) + '%'; axis.appendChild(l); });
    axiscol.appendChild(axis);
    body.appendChild(axiscol);

    const right = el('div', 'mo-right');

    const plot = el('div', 'mo-plot');
    const grid = el('div', 'mo-grid');
    TICKS.forEach(t => {
      const g = el('div', 'mo-line' + (t === 100 ? ' mo-line-demo' : ''));
      g.style.bottom = pct(t) + '%';
      if (t === 100) g.appendChild(el('span', 'mo-demo-tag', 'human demo'));
      grid.appendChild(g);
    });
    plot.appendChild(grid);

    const cols = el('div', 'mo-cols');
    d.items.forEach((it, i) => {
      const col = el('div', 'mo-col');
      col.style.setProperty('--v', it.v);
      col.style.setProperty('--d', (i * 70) + 'ms');
      col.dataset.name = it.name; col.dataset.value = it.v;
      const val = el('span', 'mo-val', '0<span class="mo-pct">%</span>'); val.dataset.v = it.v;
      col.appendChild(val);
      col.appendChild(el('div', 'mo-bar'));
      cols.appendChild(col);
    });
    plot.appendChild(cols);
    right.appendChild(plot);

    // object pictures under bars (no names)
    const icons = el('div', 'mo-icons');
    d.items.forEach((it, i) => {
      const ic = el('div', 'mo-ic');
      ic.style.transitionDelay = (i * 70 + 120) + 'ms';
      const tile = el('div', 'mo-tile');
      const img = el('img'); img.src = IC + it.icon; img.alt = it.name; img.loading = 'lazy';
      tile.appendChild(img);
      ic.appendChild(tile);
      icons.appendChild(ic);
    });
    right.appendChild(icons);
    body.appendChild(right);
    root.appendChild(body);
  }

  function countUp(root) {
    root.querySelectorAll('.mo-val').forEach((v, i) => {
      const target = +v.dataset.v, start = performance.now(), dur = 850, delay = i * 70;
      const suffix = '<span class="mo-pct">%</span>';
      function frame(now) {
        const t = Math.min(1, Math.max(0, (now - start - delay) / dur));
        const e = 1 - Math.pow(1 - t, 3);
        v.firstChild.textContent = Math.round(target * e);
        if (t < 1) requestAnimationFrame(frame); else v.innerHTML = target + suffix;
      }
      requestAnimationFrame(frame);
    });
  }

  // ===== Sim-to-real success comparison (baselines vs ablations vs ours) =====
  const SIM_COLOR = '#93a1ac';
  const REAL_COLOR = (getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#c1440e').trim();
  const S2R_MAX = 100, S2R_TICKS = [0, 25, 50, 75, 100];
  // Simulation bars = Mean Articulation (%) from the sim ablation table; real bars = real-world success.
  const S2R = {
    openbox: [
      { name: 'DexMachina*',  kind: 'baseline', sim: 95.8, real: 21.72 },
      { name: 'HERMES*',      kind: 'baseline', sim: 93.7, real: 3.37 },
      { name: 'Ours −AR−SCR', kind: 'ablation', sim: 82.9, real: 28.16 },
      { name: 'Ours −SCR',    kind: 'ablation', sim: 83.2, real: 37.83 },
      { name: 'Ours −AR',     kind: 'ablation', sim: 84.4, real: 57.32 },
      { name: 'DemoMimic',      kind: 'ours',     sim: 84.4, real: 82.71 },
    ],
    liftlid: [
      { name: 'DexMachina*',  kind: 'baseline', sim: 80.1, real: 29.91 },
      { name: 'HERMES*',      kind: 'baseline', sim: 98.4, real: 39.1 },
      { name: 'Ours −AR−SCR', kind: 'ablation', sim: 76.0, real: 37.94 },
      { name: 'Ours −SCR',    kind: 'ablation', sim: 69.9, real: 50.9 },
      { name: 'Ours −AR',     kind: 'ablation', sim: 67.3, real: 47.66 },
      { name: 'DemoMimic',      kind: 'ours',     sim: 70.0, real: 70.59 },
    ],
  };

  function buildSimReal(root) {
    root.classList.add('s2r', 'mo');
    root.textContent = '';
    root.appendChild(el('div', 'mo-title', 'Sim → Real · success rate'));

    const tabs = el('div', 's2r-tabs');
    [['openbox', 'Open the Box'], ['liftlid', 'Lift the Lid']].forEach(([slug, label], i) => {
      const b = el('button', 's2r-tab' + (i === 0 ? ' active' : ''), label);
      b.addEventListener('click', () => {
        if (b.classList.contains('active')) return;
        tabs.querySelectorAll('.s2r-tab').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        render(slug); animate();
      });
      tabs.appendChild(b);
    });
    root.appendChild(tabs);

    const legend = el('div', 's2r-legend');
    legend.innerHTML =
      '<span class="s2r-leg"><i style="background:' + SIM_COLOR + '"></i>Simulation (N&nbsp;=&nbsp;300)</span>' +
      '<span class="s2r-leg"><i style="background:' + REAL_COLOR + '"></i>Real&#8209;world (N&nbsp;=&nbsp;20)</span>';
    root.appendChild(legend);

    const body = el('div', 'mo-body');
    const axiscol = el('div', 'mo-axiscol');
    const axis = el('div', 'mo-axis');
    S2R_TICKS.forEach(t => { const l = el('div', 'mo-tick', String(t)); l.style.bottom = (t / S2R_MAX * 100) + '%'; axis.appendChild(l); });
    axiscol.appendChild(axis); body.appendChild(axiscol);

    const right = el('div', 'mo-right');
    const plot = el('div', 'mo-plot');
    const grid = el('div', 'mo-grid');
    S2R_TICKS.forEach(t => { const g = el('div', 'mo-line'); g.style.bottom = (t / S2R_MAX * 100) + '%'; grid.appendChild(g); });
    plot.appendChild(grid);
    const methods = el('div', 's2r-methods'); plot.appendChild(methods);
    right.appendChild(plot);
    const names = el('div', 's2r-names'); right.appendChild(names);
    body.appendChild(right); root.appendChild(body);

    function render(task) {
      methods.textContent = ''; names.textContent = '';
      S2R[task].forEach((m, i) => {
        const gap = (i === 2 || i === 5) ? ' gap-before' : '';
        const col = el('div', 's2r-col' + gap);
        col.dataset.name = m.name; col.dataset.sim = m.sim; col.dataset.real = m.real;
        const pair = el('div', 's2r-pair');
        [['sim', m.sim, SIM_COLOR], ['real', m.real, REAL_COLOR]].forEach(([k, v, c]) => {
          const wrap = el('div', 's2r-barwrap');
          const val = el('span', 's2r-val ' + k); val.dataset.v = v; val.textContent = '0';
          const bar = el('div', 's2r-bar ' + k); bar.style.background = c;
          bar.dataset.pct = (v / S2R_MAX * 100); bar.style.transitionDelay = (i * 55) + 'ms';
          wrap.appendChild(val); wrap.appendChild(bar);
          pair.appendChild(wrap);
        });
        col.appendChild(pair);
        methods.appendChild(col);
        names.appendChild(el('div', 's2r-name' + (m.kind === 'ours' ? ' ours' : '') + gap, m.name));
      });
    }

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function animate() {
      const bars = root.querySelectorAll('.s2r-bar');
      bars.forEach(b => { b.style.height = '0%'; });
      requestAnimationFrame(() => { bars.forEach(b => { b.style.height = b.dataset.pct + '%'; }); });
      if (reduce) { root.querySelectorAll('.s2r-val').forEach(v => v.textContent = v.dataset.v); return; }
      root.querySelectorAll('.s2r-val').forEach((v, i) => {
        const target = +v.dataset.v, start = performance.now(), dur = 800, delay = Math.floor(i / 2) * 55;
        function fr(now) { const t = Math.min(1, Math.max(0, (now - start - delay) / dur)); const e = 1 - Math.pow(1 - t, 3); v.textContent = Math.round(target * e); if (t < 1) requestAnimationFrame(fr); }
        requestAnimationFrame(fr);
      });
    }

    render('openbox');
    return { animate };
  }

  function reveal(node, cb) {
    let done = false;
    const go = () => { if (done) return; done = true; cb(); };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((ents) => { ents.forEach(en => { if (en.isIntersecting) { go(); io.disconnect(); } }); }, { threshold: 0.25 });
      io.observe(node);
    } else { go(); }
  }

  function init() {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.task-chart').forEach(c => {
      const task = c.dataset.task;
      if (!DATA[task]) return;
      build(c, task);
      reveal(c, () => { c.classList.add('in'); if (!reduce) countUp(c); else c.querySelectorAll('.mo-val').forEach(v => v.innerHTML = v.dataset.v + '<span class="mo-pct">%</span>'); });
    });

    const s2r = document.getElementById('s2rChart');
    if (s2r) { const ctrl = buildSimReal(s2r); reveal(s2r, ctrl.animate); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
