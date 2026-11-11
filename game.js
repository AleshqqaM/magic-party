'use strict';
(function (MP) {
  const C = MP.content, A = MP.art, S = MP.audio;
  const game = document.querySelector('#game');
  if (!C || !A || !S || !game) return; // запасной экран покажет index.html

  const stepList = document.querySelector('.steps');
  const soundButton = document.querySelector('.sound');
  const icon = A.icon;

  const SCREENS = ['dolls', 'wardrobe', 'room', 'party'];
  const STEPS = [['Кукла', 'person'], ['Наряд', 'dress'], ['Комната', 'paint'], ['Праздник', 'party']];
  const STORE = 'magic-party-v2';
  const SOUND_KEY = 'magic-party-sound';

  const find = (list, id) => list.find(x => x.id === id);
  const dollById = id => find(C.dolls, id) || C.dolls[0];
  const groupsFor = kind => (kind === 'wardrobe' ? C.wardrobe : C.decoration);
  const pick = list => list[Math.floor(Math.random() * list.length)];

  /* ---------- Состояние ---------- */

  function defaultOutfit(doll) {
    const o = {};
    C.wardrobe.forEach(cat => {
      const want = doll.defaults && doll.defaults[cat.id];
      o[cat.id] = want && find(cat.items, want) ? want : (cat.optional ? 'none' : cat.items[0].id);
    });
    return o;
  }
  function defaultRoom() {
    const r = {};
    C.decoration.forEach(cat => { r[cat.id] = cat.optional ? 'none' : cat.items[0].id; });
    return r;
  }
  function freshState() {
    return { screen: 0, doll: C.dolls[0].id, outfits: {}, room: defaultRoom(), tab: { wardrobe: C.wardrobe[0].id, room: C.decoration[0].id }, best: 0 };
  }

  // Проверяем сохранение по реестру: неизвестные id заменяются значениями по умолчанию.
  function clean(groups, sel, fallback) {
    const out = {};
    groups.forEach(cat => {
      const v = sel && sel[cat.id];
      out[cat.id] = (v === 'none' && cat.optional) || find(cat.items, v) ? v : fallback[cat.id];
    });
    return out;
  }
  function load() {
    const s = freshState();
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (raw && raw.v === 2) {
        if (find(C.dolls, raw.doll)) s.doll = raw.doll;
        C.dolls.forEach(d => { if (raw.outfits && raw.outfits[d.id]) s.outfits[d.id] = clean(C.wardrobe, raw.outfits[d.id], defaultOutfit(d)); });
        s.room = clean(C.decoration, raw.room, defaultRoom());
        if (raw.screen >= 0 && raw.screen < SCREENS.length) s.screen = raw.screen | 0;
        if (raw.tab && find(C.wardrobe, raw.tab.wardrobe)) s.tab.wardrobe = raw.tab.wardrobe;
        if (raw.tab && find(C.decoration, raw.tab.room)) s.tab.room = raw.tab.room;
        s.best = raw.best | 0;
      }
    } catch (e) { /* хранилище недоступно — начинаем заново */ }
    return s;
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(Object.assign({ v: 2 }, state))); } catch (e) { /* без сохранения */ }
  }

  let state = load();
  let soundOn = true;
  try { soundOn = localStorage.getItem(SOUND_KEY) !== 'off'; } catch (e) { /* по умолчанию со звуком */ }
  S.setEnabled(soundOn);

  function outfitOf(dollId) {
    if (!state.outfits[dollId]) state.outfits[dollId] = defaultOutfit(dollById(dollId));
    return state.outfits[dollId];
  }
  function resolve(groups, sel) {
    const out = {};
    groups.forEach(cat => {
      out[cat.id] = find(cat.items, sel[cat.id]) || (cat.optional ? null : cat.items[0]);
    });
    return out;
  }
  const selectionFor = kind => (kind === 'wardrobe' ? outfitOf(state.doll) : state.room);
  const kindOf = screen => (screen === 1 ? 'wardrobe' : 'room');

  /* ---------- Мелкие эффекты ---------- */

  function burst(el, colors) {
    if (!el || !el.getBoundingClientRect) return;
    const r = el.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, colors);
  }
  function burstAt(x, y, colors) {
    const palette = colors || ['#ff8cc0', '#ffd86b', '#b98cff', '#7fe0d0', '#ffffff'];
    const b = document.createElement('div');
    b.className = 'burst';
    b.style.left = x + 'px';
    b.style.top = y + 'px';
    b.setAttribute('aria-hidden', 'true');
    b.innerHTML = Array.from({ length: 10 }, (_, i) =>
      `<i style="--a:${i * 36}deg;--d:${38 + (i % 3) * 14}px;--c:${palette[i % palette.length]}">${i % 2 ? '' : icon('sparkle', 14)}</i>`).join('');
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 800);
  }
  function restartAnim(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* ---------- Разметка ---------- */

  const motif = (name, cls) => `<span class="motif ${cls}" aria-hidden="true">${icon(name, 32)}</span>`;
  const hintButton = () => `<button type="button" class="hint" data-action="hint" aria-label="Подсказка голосом">${icon('voice', 26)}</button>`;
  const action = (name, label, glyph, kind) => `<button type="button" class="action ${kind}" data-action="${name}" aria-label="${label}">${icon(glyph, 26)}<span>${label}</span></button>`;

  function dollsScreen() {
    return `<section class="selection screen-in">
      <div class="selection-header">
        ${motif('sparkle', 'heading-spark heading-left')}
        <h1 tabindex="-1">Выбери <em>куклу!</em></h1>
        ${motif('sparkle', 'heading-spark heading-right')}
        ${hintButton()}
      </div>
      <div class="doll-grid">${C.dolls.map((doll, i) => `<button type="button" class="doll-card ${doll.theme}" data-doll="${doll.id}" aria-label="${doll.name}" style="--i:${i}">
        <div class="portrait">${motif('sparkle', 'cover-spark')}${motif('heart', 'cover-heart')}${motif('star', 'cover-star')}
          ${A.dollArt(doll, resolve(C.wardrobe, outfitOf(doll.id)), 'card-' + doll.id)}</div>
        <div class="doll-caption"><span><strong>${doll.name}</strong><small>${doll.role}</small></span><span class="card-arrow">${icon('next', 23)}</span></div>
      </button>`).join('')}</div>
    </section>`;
  }

  function itemsPanel(kind) {
    const cat = find(groupsFor(kind), state.tab[kind]) || groupsFor(kind)[0];
    const sel = selectionFor(kind);
    const doll = dollById(state.doll);
    const none = cat.optional ? `<button type="button" class="swatch swatch-none" data-option="${cat.id}" data-value="none" aria-label="Убрать" aria-pressed="${sel[cat.id] === 'none'}">${icon('none', 30)}</button>` : '';
    return none + cat.items.map(item => `<button type="button" class="swatch" data-option="${cat.id}" data-value="${item.id}" aria-label="${item.name}" aria-pressed="${sel[cat.id] === item.id}">
      ${A.swatchArt(cat.id, item, doll)}<span class="swatch-check">${icon('check', 13)}</span></button>`).join('');
  }

  function tabsBar(kind) {
    return groupsFor(kind).map(cat => `<button type="button" class="tab" role="tab" data-tab="${cat.id}" aria-label="${cat.label}" aria-selected="${state.tab[kind] === cat.id}">
      ${icon(cat.icon, 28)}<span>${cat.label}</span></button>`).join('');
  }

  function editorScreen(kind) {
    const dressing = kind === 'wardrobe';
    return `<section class="workspace editor-${kind} screen-in">
      <div class="workspace-header"><h1 tabindex="-1">${dressing ? 'Наряди <em>куклу!</em>' : 'Укрась <em>комнату!</em>'}</h1>${hintButton()}</div>
      <div class="workspace-body">
        <div class="stage-wrap">
          <div class="stage ${kind}" aria-label="${dressing ? 'Гардероб' : 'Комната'}"></div>
          <button type="button" class="dice" data-action="surprise" aria-label="Сюрприз">${icon('dice', 34)}</button>
        </div>
        <div class="controls">
          <div class="tabs" role="tablist">${tabsBar(kind)}</div>
          <div class="items" role="tabpanel">${itemsPanel(kind)}</div>
          <div class="actions">
            ${action('back', 'Назад', 'back', 'secondary')}
            ${dressing ? action('next', 'В комнату', 'next', 'primary') : action('next', 'Праздник!', 'party', 'primary')}
          </div>
        </div>
      </div>
    </section>`;
  }

  function partyScreen() {
    return `<section class="finale screen-in">
      <h1 class="visually-hidden" tabindex="-1">Праздник!</h1>
      <div class="stage party" aria-label="Праздничная комната"></div>
      <div class="actions">
        ${action('back', 'Назад', 'back', 'secondary')}
        ${action('replay', 'Ещё праздник!', 'replay', 'primary')}
        <button type="button" class="action tertiary" data-action="restart" aria-label="Новая игра">${icon('restart', 28)}</button>
      </div>
    </section>`;
  }

  function confetti() {
    const colors = ['#e267a7', '#8a65d7', '#39b9aa', '#ffc065', '#fa98c5', '#5ccfff'];
    return `<div class="confetti" aria-hidden="true">${Array.from({ length: 56 }, (_, i) => `<i style="--x:${(i * 37 + 7) % 100}%;--delay:${(i % 15) * .13}s;--fall:${2.6 + (i % 8) * .14}s;--drift:${(i % 7 - 3) * 20}px;--color:${colors[i % colors.length]};--round:${i % 3 ? '2px' : '50%'}"></i>`).join('')}</div>`;
  }

  function stageMarkup(kind) {
    const doll = `<div class="stage-doll"><button type="button" class="doll-btn" data-action="poke" aria-label="${dollById(state.doll).name}"></button></div>`;
    if (kind === 'wardrobe') {
      return `<div class="dressing-wall"></div><div class="lights" aria-hidden="true">${'<i></i>'.repeat(11)}</div><div class="dressing-floor"></div><div class="mirror"></div>
        ${motif('sparkle', 'stage-spark one')}${motif('heart', 'stage-spark two')}${motif('sparkle', 'stage-spark three')}${motif('star', 'stage-spark four')}${doll}`;
    }
    const layers = C.decoration.filter(c => c.id !== 'wall').map(c => `<div class="prop prop-${c.id}" data-layer="${c.id}"></div>`).join('');
    const party = kind === 'party'
      ? `<div class="party-title">Ура!</div>${motif('star', 'twinkle one')}${motif('sparkle', 'twinkle two')}${motif('sparkle', 'twinkle three')}${motif('star', 'twinkle four')}<div class="confetti-host">${confetti()}</div>
         <div class="catch-layer" aria-hidden="true"></div><div class="score" aria-label="Пойманные звёздочки">${icon('star', 26)}<b>0</b></div>`
      : '';
    return `<div class="room-walls"><div class="window"></div><div class="rug"></div></div>${layers}${doll}${party}`;
  }

  /* ---------- Обновление сцены по слоям ---------- */

  const stageEl = () => game.querySelector('.stage');

  function updateDoll(animate) {
    const btn = game.querySelector('.doll-btn');
    if (!btn) return;
    btn.innerHTML = A.dollArt(dollById(state.doll), resolve(C.wardrobe, outfitOf(state.doll)), 'stage');
    if (animate) restartAnim(btn.parentNode, 'changed');
  }
  function updateWalls(animate) {
    const walls = game.querySelector('.room-walls');
    if (!walls) return;
    const item = find(C.decoration[0].items, state.room.wall) || C.decoration[0].items[0];
    const c = item.colors;
    walls.style.cssText = `--wall:${c[0]};--trim:${c[1]};--floor:${c[2]};--line:${c[3]}`;
    walls.classList.toggle('night', !!item.night);
    if (animate) restartAnim(walls, 'flash');
  }
  function updateLayer(id) {
    const layer = game.querySelector(`[data-layer="${id}"]`);
    if (!layer) return;
    const cat = find(C.decoration, id);
    const item = find(cat.items, state.room[id]);
    layer.innerHTML = item ? A.propArt(id, item) : '';
  }
  function buildStage(kind) {
    const stage = stageEl();
    if (!stage) return;
    stage.innerHTML = stageMarkup(kind);
    if (kind !== 'wardrobe') {
      updateWalls(false);
      C.decoration.forEach(c => { if (c.id !== 'wall') updateLayer(c.id); });
    }
    updateDoll(false);
  }

  /* ---------- Праздник: звёздочки, свечи, музыка ---------- */

  let starTimer = null;
  let score = 0;
  let candlesOut = false;

  function startParty(first) {
    stopParty();
    score = 0;
    candlesOut = false;
    S.play('party');
    setTimeout(() => { if (state.screen === 3) S.startMusic(); }, first ? 1300 : 1100);
    starTimer = setInterval(spawnStar, 1100);
  }
  function stopParty() {
    clearInterval(starTimer);
    starTimer = null;
    S.stopMusic();
  }
  function spawnStar() {
    const layer = game.querySelector('.catch-layer');
    if (!layer || document.hidden) return;
    if (layer.childElementCount > 5) return;
    const s = document.createElement('span');
    s.className = 'catch-star';
    s.style.left = (8 + Math.random() * 78) + '%';
    s.style.setProperty('--fall', (4.2 + Math.random() * 2.2) + 's');
    s.style.setProperty('--sway', (Math.random() * 40 - 20) + 'px');
    s.style.color = pick(['#ffd86b', '#ff8cc0', '#b98cff', '#7fe0d0']);
    s.innerHTML = icon('star', 44);
    s.addEventListener('animationend', () => s.remove());
    layer.appendChild(s);
  }
  function catchStar(el) {
    burst(el, ['#ffd86b', '#fff3b0', '#ffffff']);
    el.remove();
    score++;
    S.play('star');
    const b = game.querySelector('.score b');
    if (b) { b.textContent = score; restartAnim(b.parentNode, 'bump'); }
    if (score > state.best) { state.best = score; save(); }
    if (score % 5 === 0) { S.play('surprise'); S.speak(String(score) + '!', 150); }
  }
  function toggleCandles(el) {
    candlesOut = !candlesOut;
    const layer = game.querySelector('.prop-cake');
    if (layer) layer.classList.toggle('out', candlesOut);
    if (candlesOut) {
      S.play('candle');
      S.speak('С праздником!', 500);
      const host = game.querySelector('.confetti-host');
      if (host) host.innerHTML = confetti();
      burst(el, ['#ffd86b', '#ff8cc0', '#ffffff']);
    } else S.play('sparkle');
  }

  /* ---------- Экраны и навигация ---------- */

  function renderSteps() {
    stepList.innerHTML = STEPS.map(([name, glyph], i) => {
      const done = i < state.screen;
      const inner = `<span>${icon(done ? 'check' : glyph, 20)}</span><small>${name}</small>`;
      return `<li class="${done ? 'done' : ''}" ${i === state.screen ? 'aria-current="step"' : ''}>${done ? `<button type="button" data-step="${i}" aria-label="${name}">${inner}</button>` : inner}</li>`;
    }).join('');
  }

  let lockUntil = 0;
  function render(opts) {
    opts = opts || {};
    stopParty();
    renderSteps();
    const screen = state.screen;
    game.innerHTML = screen === 0 ? dollsScreen() : screen === 3 ? partyScreen() : editorScreen(kindOf(screen));
    if (screen === 1) buildStage('wardrobe');
    if (screen === 2) buildStage('room');
    if (screen === 3) { buildStage('party'); startParty(true); }
    lockUntil = Date.now() + 350; // защита от двойного касания при смене экрана
    if (opts.speak !== false) S.speak(C.voice[SCREENS[screen]], screen === 3 ? 900 : 250);
    if (opts.focus !== false) {
      window.scrollTo(0, 0);
      const h = game.querySelector('h1');
      if (h) h.focus({ preventScroll: true });
    }
  }

  const hasHistory = (() => { try { return typeof history.pushState === 'function'; } catch (e) { return false; } })();

  function go(screen) {
    state.screen = screen;
    save();
    if (hasHistory) { try { history.pushState({ mp: screen }, ''); } catch (e) { /* без истории */ } }
    render();
  }
  function goBack() {
    if (state.screen === 0) return;
    S.play('back');
    if (hasHistory && history.state && history.state.mp === state.screen) { history.back(); return; }
    state.screen -= 1;
    save();
    render();
  }
  function jumpTo(target) {
    if (target >= state.screen) return;
    S.play('back');
    if (hasHistory && history.state && history.state.mp === state.screen) { history.go(target - state.screen); return; }
    state.screen = target;
    save();
    render();
  }

  window.addEventListener('popstate', e => {
    const s = e.state && typeof e.state.mp === 'number' ? e.state.mp : 0;
    closeConfirm(true);
    if (s === state.screen) return;
    state.screen = Math.max(0, Math.min(SCREENS.length - 1, s));
    save();
    render();
  });

  /* ---------- Подтверждение «Новая игра» картинками ---------- */

  function openConfirm() {
    if (document.querySelector('.overlay')) return;
    const o = document.createElement('div');
    o.className = 'overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-label', 'Начать заново?');
    o.innerHTML = `<div class="sheet">
      <div class="sheet-picture" aria-hidden="true">${icon('restart', 72)}</div>
      <div class="sheet-buttons">
        <button type="button" class="big-choice no" data-confirm="no" aria-label="Нет, остаться">${icon('close', 46)}</button>
        <button type="button" class="big-choice yes" data-confirm="yes" aria-label="Да, начать заново">${icon('check', 46)}</button>
      </div></div>`;
    o.addEventListener('click', e => {
      const b = e.target.closest('[data-confirm]');
      if (!b && e.target !== o) return;
      if (b && b.dataset.confirm === 'yes') newGame();
      else { S.play('back'); closeConfirm(); }
    });
    document.body.appendChild(o);
    S.play('question');
    S.speak(C.voice.confirm, 250);
    setTimeout(() => { const no = o.querySelector('.no'); if (no) no.focus(); }, 50);
  }
  function closeConfirm(silent) {
    const o = document.querySelector('.overlay');
    if (o) o.remove();
    if (!silent) { const r = game.querySelector('[data-action="restart"]'); if (r) r.focus(); }
  }
  function newGame() {
    closeConfirm(true);
    S.play('yes');
    const best = state.best;
    const from = state.screen;
    state = freshState();
    state.best = best;
    save();
    if (hasHistory && from > 0 && history.state && history.state.mp === from) history.go(-from);
    render();
  }

  /* ---------- Сюрприз (кубик) ---------- */

  let shuffling = false;
  function surprise(button) {
    if (shuffling) return;
    shuffling = true;
    const kind = kindOf(state.screen);
    const groups = groupsFor(kind);
    const sel = selectionFor(kind);
    button.classList.add('rolling');
    let n = 0;
    const tick = () => {
      groups.forEach(cat => {
        const chance = cat.optional ? (kind === 'room' ? .85 : .45) : 1;
        sel[cat.id] = Math.random() < chance ? pick(cat.items).id : 'none';
      });
      if (kind === 'wardrobe') updateDoll(n === 6);
      else { updateWalls(n === 6); groups.forEach(c => { if (c.id !== 'wall') updateLayer(c.id); }); }
      if (n < 6) { S.play('tick'); n++; setTimeout(tick, 110); return; }
      button.classList.remove('rolling');
      shuffling = false;
      game.querySelector('.items').innerHTML = itemsPanel(kind);
      S.play('surprise');
      S.speak(C.voice.surprise, 200);
      burst(stageEl());
      save();
    };
    tick();
  }

  /* ---------- Касания ---------- */

  game.addEventListener('pointerdown', e => {
    const star = e.target.closest('.catch-star');
    if (star) { e.preventDefault(); catchStar(star); return; }
    if (state.screen !== 3) return;
    const stage = e.target.closest('.stage.party');
    if (!stage || e.target.closest('button') || e.target.closest('.prop-cake')) return;
    // Касание в пустом месте праздника — звёздочка и нота.
    S.play('star');
    burstAt(e.clientX, e.clientY);
  });

  game.addEventListener('click', e => {
    const cake = state.screen === 3 && e.target.closest('.prop-cake');
    if (cake && cake.childElementCount) { toggleCandles(cake); return; }
    const button = e.target.closest('button');
    if (!button) return;
    if (Date.now() < lockUntil && !button.classList.contains('swatch')) return;
    const d = button.dataset;

    if (d.doll) {
      state.doll = d.doll;
      S.play('next');
      S.speak(dollById(d.doll).name + '!');
      burst(button.querySelector('.doll-art'));
      setTimeout(() => go(1), 260);
      lockUntil = Date.now() + 600;
      return;
    }
    if (d.tab) {
      const kind = kindOf(state.screen);
      state.tab[kind] = d.tab;
      game.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', String(t === button)));
      const items = game.querySelector('.items');
      items.innerHTML = itemsPanel(kind);
      restartAnim(items, 'items-in');
      S.play('tap');
      S.speak(find(groupsFor(kind), d.tab).label);
      save();
      return;
    }
    if (d.option) {
      const kind = kindOf(state.screen);
      const cat = find(groupsFor(kind), d.option);
      const sel = selectionFor(kind);
      sel[d.option] = d.value;
      button.parentNode.querySelectorAll('.swatch').forEach(s => s.setAttribute('aria-pressed', String(s === button)));
      if (kind === 'wardrobe') updateDoll(true);
      else if (d.option === 'wall') updateWalls(true);
      else updateLayer(d.option);
      if (d.value === 'none') { S.play('none'); S.speak(C.voice.none); }
      else {
        S.play(cat.sound || 'tap');
        S.speak(find(cat.items, d.value).name, 280);
        burst(button);
      }
      save();
      return;
    }
    if (d.step) { jumpTo(Number(d.step)); return; }

    switch (d.action) {
      case 'hint': S.play('tap'); S.speak(C.voice[SCREENS[state.screen]]); restartAnim(button, 'bump'); break;
      case 'back': goBack(); break;
      case 'next': S.play('next'); go(state.screen + 1); break;
      case 'surprise': surprise(button); break;
      case 'poke': {
        S.play('giggle');
        restartAnim(button.parentNode, 'poke');
        burst(button, ['#ff8cc0', '#ffd86b', '#ffffff']);
        break;
      }
      case 'replay': {
        buildStage('party');
        startParty(false);
        S.speak('Ещё раз!', 200);
        break;
      }
      case 'restart': openConfirm(); break;
    }
  });

  stepList.addEventListener('click', e => {
    const b = e.target.closest('[data-step]');
    if (b) jumpTo(Number(b.dataset.step));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.querySelector('.overlay')) { S.play('back'); closeConfirm(); }
  });

  /* ---------- Звук ---------- */

  function updateSound() {
    soundButton.setAttribute('aria-pressed', String(soundOn));
    soundButton.setAttribute('aria-label', soundOn ? 'Выключить звук' : 'Включить звук');
    soundButton.innerHTML = `${icon(soundOn ? 'sound' : 'mute', 24)}<span>${soundOn ? 'Звук' : 'Без звука'}</span>`;
  }
  soundButton.addEventListener('click', () => {
    soundOn = !soundOn;
    try { localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off'); } catch (e) { /* без сохранения */ }
    S.setEnabled(soundOn);
    if (soundOn) {
      S.play('tap');
      if (state.screen === 3) S.startMusic();
    }
    updateSound();
  });

  /* ---------- Старт ---------- */

  document.querySelector('.brand-mark').innerHTML = icon('heart', 27);
  updateSound();
  if (hasHistory) {
    try {
      history.replaceState({ mp: 0 }, '');
      for (let i = 1; i <= state.screen; i++) history.pushState({ mp: i }, '');
    } catch (e) { /* без истории */ }
  }
  render({ focus: false, speak: false });
  MP.started = true;
})(window.MP = window.MP || {});
