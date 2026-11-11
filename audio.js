'use strict';
/* Звуки (синтез WebAudio, без файлов), музыка праздника и голос (синтез речи браузера). */
(function (MP) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const MAX_VOICES = 14;
  let ctx = null, master = null, noise = null;
  let enabled = true;
  const voices = [];
  let music = null;
  let ruVoice = null;

  // iOS 17+: играть звук даже при беззвучном переключателе (иначе WebAudio молчит).
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* не поддерживается */ }

  function ensure() {
    if (!AudioCtx) return null;
    if (!ctx) {
      try {
        ctx = new AudioCtx();
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16; comp.ratio.value = 6;
        master = ctx.createGain();
        master.gain.value = .9;
        master.connect(comp).connect(ctx.destination);
        const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        noise = buffer;
      } catch (e) { ctx = null; return null; }
    }
    if (ctx.state !== 'running' && enabled && !document.hidden) ctx.resume().catch(() => {});
    return ctx;
  }

  // Первое касание «разблокирует» звук на iOS — создаём контекст внутри жеста.
  function unlock() {
    const c = ensure();
    if (c) {
      try {
        const src = c.createBufferSource();
        src.buffer = c.createBuffer(1, 1, 22050);
        src.connect(c.destination);
        src.start(0);
      } catch (e) { /* ничего */ }
    }
    loadVoice();
  }
  ['pointerdown', 'touchend', 'keydown'].forEach(type => document.addEventListener(type, unlock, { passive: true, capture: true }));

  function track(node, until) {
    voices.push({ node, until });
    if (voices.length > MAX_VOICES) {
      const old = voices.shift();
      try { old.node.stop(); } catch (e) { /* уже остановлен */ }
    }
    node.onended = () => {
      const i = voices.findIndex(v => v.node === node);
      if (i >= 0) voices.splice(i, 1);
      try { node.disconnect(); } catch (e) { /* ничего */ }
    };
  }

  function tone(freq, start, opts) {
    opts = opts || {};
    const dur = opts.dur || .2;
    const vol = opts.vol || .08;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, start);
    if (opts.slide) osc.frequency.exponentialRampToValueAtTime(opts.slide, start + dur);
    g.gain.setValueAtTime(.0001, start);
    g.gain.exponentialRampToValueAtTime(vol, start + (opts.attack || .015));
    g.gain.exponentialRampToValueAtTime(.0001, start + dur);
    osc.connect(g).connect(opts.out || master);
    osc.start(start);
    osc.stop(start + dur + .02);
    track(osc, start + dur);
  }

  function hiss(start, opts) {
    opts = opts || {};
    const dur = opts.dur || .2;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.filter || 'bandpass';
    filter.frequency.setValueAtTime(opts.from || 1200, start);
    if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, start + dur);
    filter.Q.value = opts.q || 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(.0001, start);
    g.gain.exponentialRampToValueAtTime(opts.vol || .12, start + (opts.attack || .02));
    g.gain.exponentialRampToValueAtTime(.0001, start + dur);
    src.connect(filter).connect(g).connect(master);
    src.start(start, Math.random() * .5);
    src.stop(start + dur + .02);
    track(src, start + dur);
  }

  const notes = (list, t, gap, opts) => list.forEach((f, i) => tone(f, t + i * gap, opts));

  const sounds = {
    tap: t => notes([523.25, 659.25], t, .06),
    next: t => notes([523.25, 659.25, 783.99], t, .07, { vol: .07 }),
    back: t => notes([659.25, 523.25], t, .07, { vol: .06 }),
    dress: t => { hiss(t, { from: 600, to: 3200, dur: .32, vol: .07 }); notes([783.99, 987.77, 1318.5], t + .12, .07, { vol: .06 }); },
    shoe: t => { tone(1400, t, { type: 'triangle', dur: .05, vol: .12 }); tone(1100, t + .13, { type: 'triangle', dur: .05, vol: .12 }); },
    hair: t => notes([1046.5, 1318.5, 1568, 2093], t, .045, { vol: .05, dur: .3 }),
    bell: t => { tone(1567.98, t, { dur: .7, vol: .07 }); tone(3135.96, t, { dur: .4, vol: .025 }); tone(2349.3, t + .09, { dur: .6, vol: .04 }); },
    sparkle: t => notes([1760, 2217.5, 2637, 3520], t, .05, { vol: .035, dur: .25, type: 'triangle' }),
    paint: t => { hiss(t, { from: 400, to: 1800, dur: .45, vol: .1, filter: 'lowpass', q: .7 }); tone(392, t + .2, { dur: .3, vol: .05 }); },
    pop: t => { hiss(t, { from: 2000, dur: .08, vol: .25, filter: 'highpass', attack: .003 }); tone(320, t, { slide: 120, dur: .12, vol: .1, type: 'triangle' }); notes([880, 1174.7], t + .1, .07, { vol: .05 }); },
    yum: t => { tone(392, t, { slide: 523, dur: .18, vol: .08, type: 'triangle' }); tone(659.25, t + .2, { slide: 784, dur: .25, vol: .08, type: 'triangle' }); },
    tinkle: t => notes([2093, 1760, 2349.3, 1975.5, 2637], t, .06, { vol: .04, dur: .3 }),
    pet: t => { tone(740, t, { slide: 1100, dur: .14, vol: .08, type: 'triangle' }); tone(1000, t + .17, { slide: 700, dur: .2, vol: .08, type: 'triangle' }); },
    none: t => tone(600, t, { slide: 250, dur: .25, vol: .07, type: 'triangle' }),
    giggle: t => [0, 1, 2, 3].forEach(i => tone(880 + i * 60, t + i * .09, { slide: 700 + i * 60, dur: .08, vol: .07, type: 'triangle' })),
    tick: t => tone(1200 + Math.random() * 600, t, { type: 'square', dur: .03, vol: .025 }),
    surprise: t => { notes([523.25, 659.25, 783.99, 1046.5, 1318.5], t, .06, { vol: .06 }); hiss(t + .3, { from: 3000, dur: .3, vol: .04, filter: 'highpass' }); },
    question: t => { tone(523.25, t, { dur: .18 }); tone(659.25, t + .18, { slide: 880, dur: .28 }); },
    yes: t => notes([659.25, 783.99, 1046.5], t, .08, { vol: .07 }),
    star: t => { const scale = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093]; tone(scale[Math.floor(Math.random() * scale.length)], t, { dur: .45, vol: .06, type: 'triangle' }); },
    party: t => notes([523.25, 659.25, 783.99, 1046.5, 880, 987.77, 1046.5], t, .15, { vol: .07 }),
    candle: t => { hiss(t, { from: 800, to: 300, dur: .5, vol: .12, filter: 'lowpass' }); notes([1318.5, 1568, 2093], t + .35, .09, { vol: .05 }); }
  };

  function play(name) {
    if (!enabled || !sounds[name]) return;
    const c = ensure();
    if (!c) return;
    try { sounds[name](c.currentTime + .01); } catch (e) { /* игра работает без звука */ }
  }

  /* ---------- Музыка праздника: весёлая петля, планировщик с упреждением ---------- */
  const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, C3: 130.81, F3: 174.61, G3: 196, A3: 220 };
  const melody = [
    'E5', 'G5', 'A5', 'G5', 'E5', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4', 'C5', 'D5', '-', 'G4', '-',
    'E5', 'G5', 'A5', 'G5', 'E5', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5', 'C5', 'C5', '-', '-', '-'
  ];
  const bass = ['C3', 'G3', 'A3', 'F3', 'C3', 'G3', 'F3', 'C3'];

  function startMusic() {
    stopMusic();
    if (!enabled) return;
    const c = ensure();
    if (!c) return;
    const bus = c.createGain();
    bus.gain.value = .6;
    bus.connect(master);
    const step = .18;
    let index = 0;
    let next = c.currentTime + .7;
    const timer = setInterval(() => {
      if (!ctx || ctx.state !== 'running') return;
      while (next < ctx.currentTime + .4) {
        const m = melody[index % melody.length];
        if (m !== '-') tone(N[m], next, { dur: step * 1.6, vol: .045, type: 'triangle', out: bus });
        if (index % 4 === 0) tone(N[bass[Math.floor(index / 4) % bass.length]], next, { dur: step * 3.5, vol: .06, out: bus });
        if (index % 2 === 0) hiss(next, { from: 7000, dur: .04, vol: .02, filter: 'highpass', attack: .003 });
        index++;
        next += step;
      }
    }, 90);
    music = { timer, bus };
  }

  function stopMusic() {
    if (!music) return;
    clearInterval(music.timer);
    const bus = music.bus;
    try {
      bus.gain.setTargetAtTime(.0001, ctx.currentTime, .08);
      setTimeout(() => { try { bus.disconnect(); } catch (e) { /* ничего */ } }, 500);
    } catch (e) { /* ничего */ }
    music = null;
  }

  /* ---------- Голос ---------- */
  function loadVoice() {
    if (!('speechSynthesis' in window) || ruVoice) return;
    const list = speechSynthesis.getVoices();
    const ru = list.filter(v => /^ru/i.test(v.lang));
    ruVoice = ru.find(v => /milena|милена/i.test(v.name)) || ru.find(v => v.localService) || ru[0] || null;
  }
  if ('speechSynthesis' in window) {
    try { speechSynthesis.addEventListener('voiceschanged', loadVoice); } catch (e) { speechSynthesis.onvoiceschanged = loadVoice; }
  }

  function speak(text, delay) {
    if (!enabled || !text || !('speechSynthesis' in window)) return;
    const run = () => {
      try {
        speechSynthesis.cancel();
        loadVoice();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ru-RU';
        if (ruVoice) u.voice = ruVoice;
        u.rate = .95;
        u.pitch = 1.2;
        u.volume = 1;
        speechSynthesis.speak(u);
      } catch (e) { /* без голоса */ }
    };
    if (delay) setTimeout(run, delay); else run();
  }

  function silence() {
    stopMusic();
    voices.splice(0).forEach(v => { try { v.node.stop(); } catch (e) { /* ничего */ } });
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* ничего */ }
  }

  function setEnabled(on) {
    enabled = on;
    if (!on) silence();
    else ensure();
  }

  // Свернули вкладку — тишина и пауза (батарея), вернулись — продолжаем.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) {
      try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* ничего */ }
      ctx.suspend().catch(() => {});
    } else if (enabled) ctx.resume().catch(() => {});
  });

  MP.audio = { play, speak, startMusic, stopMusic, setEnabled, silence, isMusicOn: () => !!music };
})(window.MP = window.MP || {});
