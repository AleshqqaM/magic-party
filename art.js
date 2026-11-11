'use strict';
/* Оригинальная процедурная SVG-графика. Данные (цвета, списки) — в content.js. */
(function (MP) {
  const last = list => list[list.length - 1];

  const glyphs = {
    heart: '<path fill="currentColor" stroke="none" d="M12 21S2 15 2 9c0-5 6-7 10-2 4-5 10-3 10 2 0 6-10 12-10 12Z"/>',
    star: '<path fill="currentColor" stroke="none" d="m12 1 3 7 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/>',
    sparkle: '<path fill="currentColor" stroke="none" d="M12 0c1 8 4 11 12 12-8 1-11 4-12 12C11 16 8 13 0 12 8 11 11 8 12 0Z"/>',
    person: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    dress: '<path d="m8 3 4 3 4-3 2 4-3 5 5 8a20 20 0 0 1-16 0l5-8-3-5Z"/><path d="M9 12h6"/>',
    shoe: '<path d="M4 6c2 3 4 6 8 8l6-1c2 0 4 2 4 4v2H11l-5-4v4H2v-7Z"/>',
    hair: '<path d="M3 19V9a9 9 0 0 1 18 0v10l-5 2-1-4m-6 0-1 4-5-2Zm0-8c4 0 8-2 10-5 0 2 1 4 2 5M7 11v2a5 5 0 0 0 10 0v-2"/>',
    crown: '<path d="m2 6 5 4 5-7 5 7 5-4-2 13H4Z"/><path d="M5 15h14"/>',
    glasses: '<path d="M2 11c0-3 7-3 8 0 0 4-1 6-4 6s-4-2-4-6Zm12 0c1-3 8-3 8 0 0 4-1 6-4 6s-4-2-4-6Zm-4 0q2-2 4 0"/>',
    balloons: '<ellipse cx="9" cy="8" rx="6" ry="7"/><path d="M9 15c-4 4 4 4 0 8M16 5c8-1 8 12 1 12m0 0c-3 3 2 4 0 6"/>',
    paint: '<path d="M12 3a9 9 0 1 0 0 18c2 0 2-2 1-3s0-3 2-3h2c3 0 4-2 4-4a9 9 0 0 0-9-8Z"/><path d="M7 11h.01m3-4h.01m5 1h.01m3 3h.01"/>',
    cake: '<rect x="3" y="11" width="18" height="9" rx="2"/><path d="M2 20h20M3 14q2 4 5 0 2 4 4 0 2 4 4 0 3 4 5 0M12 11V7m0-5 1 2-1 1-1-1Z"/>',
    garland: '<path d="M2 5q10 7 20 0M3 6l1 8 6-5 2 8 3-8 6 5 1-8"/>',
    paw: '<g fill="currentColor" stroke="none"><ellipse cx="12" cy="16" rx="5" ry="4.2"/><circle cx="5.5" cy="10.5" r="2.3"/><circle cx="9.5" cy="6.5" r="2.3"/><circle cx="14.5" cy="6.5" r="2.3"/><circle cx="18.5" cy="10.5" r="2.3"/></g>',
    party: '<path d="m4 20 3-13 10 10Z"/><path d="M7 12l5 6M13 8l1-4m3 7 4-1m-3 5 3 1m-2-9 2-4"/>',
    sound: '<path d="M3 9h4l5-4v14l-5-4H3Z"/><path d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="M3 9h4l5-4v14l-5-4H3Z"/><path d="m16 9 6 6m0-6-6 6"/>',
    voice: '<path d="M4 4h16v12H10l-5 4v-4H4Z"/><path d="M8 10h.01M12 10h.01M16 10h.01" stroke-width="3"/>',
    check: '<path d="m5 12 4 4 10-10"/>',
    next: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
    replay: '<path d="M4 11a8 8 0 1 1 2 6M4 5v6h6"/>',
    restart: '<path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5"/><path fill="currentColor" stroke="none" d="m12 8 1.2 2.6 2.8.3-2.1 1.9.6 2.8-2.5-1.5-2.5 1.5.6-2.8L8 10.9l2.8-.3Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="5"/><g fill="currentColor" stroke="none"><circle cx="8" cy="8" r="1.7"/><circle cx="16" cy="8" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="8" cy="16" r="1.7"/><circle cx="16" cy="16" r="1.7"/></g>',
    none: '<circle cx="12" cy="12" r="9"/><path d="m6 18 12-12"/>'
  };

  function icon(name, size) {
    size = size || 24;
    return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyphs[name] || ''}</svg>`;
  }

  function spark(x, y, size, color) {
    return `<path d="M0-10Q1-1 8 0 1 1 0 10-1 1-8 0-1-1 0-10Z" transform="translate(${x} ${y}) scale(${size})" fill="${color || '#fff'}"/>`;
  }

  function gradient(id, colors, diagonal) {
    return `<linearGradient id="${id}" x1="0%" y1="0%" x2="${diagonal ? '100%' : '0%'}" y2="${diagonal ? '24%' : '100%'}">${colors.map((color, i) => `<stop offset="${i * 100 / (colors.length - 1)}%" stop-color="${color}"/>`).join('')}</linearGradient>`;
  }

  function picture(box, content, cls) {
    return `<svg viewBox="${box}" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${content}</svg>`;
  }

  const heartPath = 'M0 14C-22 0-22-16-10-18-4-19 0-14 0-10 0-14 4-19 10-18 22-16 22 0 0 14Z';

  /* ---------- Одежда ---------- */

  const skirts = [
    'M100 228q29 8 60 0c11 22 28 39 39 61-7 12-23 16-33 10-10 11-25 13-36 6-13 7-29 4-37-5-14 6-27 1-32-10 11-21 29-38 39-62Z',
    'M100 229q30 5 60 0c6 20 19 43 22 65q-52 19-104 0c3-22 16-45 22-65Z',
    'M100 228q30 5 60 0l17 34-12 4 23 28q-58 21-116 0l23-28-12-4Z',
    'M100 228q30 5 60 0c11 16 22 28 23 47 1 16-22 29-53 30-31-1-54-14-53-30 1-19 12-31 23-47Z'
  ];
  const pleats = [
    'M102 240q-12 31-19 48m36-49-6 51m27-51 6 51m12-50q12 31 19 48M70 288q15 10 24 3 17 15 36 5 19 10 36-5 13 6 24-3',
    'm111 241-13 54m51-54 13 54M86 281q44 12 88 0M90 270q40 11 80 0',
    'M94 261q36 14 72 0m-82 25q46 16 92 0M109 241l-9 16m51-16 9 16',
    'M104 240q-21 29-15 42m67-42q21 29 15 42M103 289q27 11 54 0'
  ];

  function garment(shape, fill) {
    const s = shape % skirts.length;
    return `<g stroke="#55315e" stroke-opacity=".42" stroke-width="2.5" stroke-linejoin="round" fill="${fill}">
      <path d="${skirts[s]}"/>
      <path d="M99 194q9-7 18-7c5 10 21 10 26 0q10 0 18 7l-6 20 5 16q-30 13-60 0l5-16Z"/>
      <path d="M104 226q26 10 52 0l4 7q-30 12-60 0Z" fill="#fff1fb" fill-opacity=".9"/>
      <path d="M109 196q21 13 42 0m-21 9v16 ${pleats[s]}" fill="none" stroke="#fff5ff" stroke-opacity=".69" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <g fill="#fff6e4" opacity=".85">${[[112, 251, 2], [136, 268, 2.6], [151, 246, 1.7], [106, 281, 1.7], [158, 281, 2.3], [128, 282, 1.7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
    ${spark(130, 228, .67, '#fff3b7')}${spark(155, 258, .35)}${spark(110, 263, .25)}`;
  }

  const shoeShapes = [
    'M91 326q12 10 23 3l-1 17q-11 9-31 3c-4-3-4-8 1-12Z',
    'M92 316q11 7 24 3l-3 29q-13 8-30 2c-6-4-3-10 4-14Z',
    'M92 330q11 5 23 0l-2 17q-17 9-34 2c-3-5 2-11 13-19Z'
  ];
  const shoeDetails = ['M86 337q14 6 27-1', 'M94 324q9 4 19 2m-20 6q9 4 19 2', 'M81 344q14 5 31-1m-21-8 11 4m-7-7 11 4'];

  function shoes(item) {
    const s = item.shape % shoeShapes.length;
    const light = item.color === '#f4eef8';
    const shoe = `<path d="${shoeShapes[s]}" fill="${item.color}" stroke="#54305e" stroke-opacity=".52" stroke-width="2.2"/><path d="${shoeDetails[s]}" fill="none" stroke="${light ? '#c9a6d8' : '#fff4fc'}" stroke-width="2" stroke-linecap="round"/>`;
    return `<g>${shoe}<g transform="translate(260 0) scale(-1 1)">${shoe}</g></g>`;
  }

  const jewels = {
    crown: '<path d="m-21 4-4-15 13 6L0-21 12-5l13-6-4 15q-21 8-42 0Z" fill="#ffda82" stroke="#b86e49" stroke-width="2"/><path d="M-19 1q19 6 38 0" fill="none" stroke="#fff6c4" stroke-width="2"/><path d="m0-11 6 6-6 7-6-7Z" fill="#ef70a9"/><circle cy="-21" r="3" fill="#fff6c4"/>',
    bow: '<path d="M0-3c-25-25-33-17-28-1-5 15 3 20 28 5C25 16 33 11 28-4 33-20 25-28 0-3Z" fill="#eaa9fb" stroke="#8052ae" stroke-width="2"/><path d="M-23-11q9 0 18 7m28-7q-9 0-18 7" fill="none" stroke="#fff1ff" stroke-width="2.5"/><rect x="-6" y="-7" width="12" height="13" rx="4" fill="#bc74e0" stroke="#8052ae" stroke-width="2"/>',
    star: '<path d="m0-21 6 13 15 2-11 10 3 15L0 12l-13 7 3-15-11-10 15-2Z" fill="#ffdb7b" stroke="#b8764e" stroke-width="2"/><path d="m0-14 4 10 10 1-8 7" fill="none" stroke="#fff6ca" stroke-width="2.6" stroke-linecap="round"/>',
    flower: '<g fill="#fff1cb" stroke="#b968a3" stroke-width="1.8"><ellipse cy="-9" rx="7" ry="11"/><ellipse cy="-9" rx="7" ry="11" transform="rotate(72)"/><ellipse cy="-9" rx="7" ry="11" transform="rotate(144)"/><ellipse cy="-9" rx="7" ry="11" transform="rotate(216)"/><ellipse cy="-9" rx="7" ry="11" transform="rotate(288)"/><circle r="7" fill="#f398bf"/></g>',
    heart: `<path d="${heartPath}" transform="scale(1.2)" fill="#ff7fb5" stroke="#b8336f" stroke-width="1.8"/><path d="M-12-12q4-3 8 0" transform="scale(1.2)" fill="none" stroke="#ffe3f0" stroke-width="2.4" stroke-linecap="round"/>`,
    tiara: '<path d="M-36 6q36-20 72 0l-4 6q-32-16-64 0Z" fill="#e7ecff" stroke="#7a86c9" stroke-width="2"/><path d="m-24-2-3-12 8 8 6-16 6 14L0-22l7 14 6-14 6 16 8-8-3 12" fill="#f2f5ff" stroke="#7a86c9" stroke-width="2" stroke-linejoin="round"/><circle cy="-6" r="4.5" fill="#8fd3ff" stroke="#4b7fc4" stroke-width="1.5"/><circle cx="-17" cy="-1" r="3" fill="#ff9ccc"/><circle cx="17" cy="-1" r="3" fill="#ff9ccc"/>'
  };

  function jewel(shape) { return jewels[shape] || ''; }

  /* Дополнения: очки, блёстки, сумочка, палочка. Координаты — в системе куклы 260×366. */
  const extras = {
    glasses: `<g fill="#ff8cc0" fill-opacity=".3" stroke="#d63c84" stroke-width="4" stroke-linejoin="round">
        <path d="${heartPath}" transform="translate(92 131) scale(1.5)"/><path d="${heartPath}" transform="translate(168 131) scale(1.5)"/></g>
      <path d="M115 122q15-8 30 0M59 120l-8-6m150 6 8-6" fill="none" stroke="#d63c84" stroke-width="4" stroke-linecap="round"/>
      <path d="M74 112q6-5 12-3m70 3q6-5 12-3" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>`,
    freckles: `${spark(68, 151, .45, '#ffd86b')}${spark(84, 160, .3, '#fff')}${spark(192, 151, .45, '#ffd86b')}${spark(176, 160, .3, '#fff')}
      <path d="${heartPath}" transform="translate(78 143) scale(.22)" fill="#ff6fae"/><path d="${heartPath}" transform="translate(182 143) scale(.22)" fill="#ff6fae"/>`,
    bag: `<path d="M188 258q13-22 26 0" fill="none" stroke="#a8336f" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="179" y="256" width="44" height="34" rx="10" fill="#f68bc4" stroke="#a8336f" stroke-width="2.4"/>
      <path d="M179 268h44" stroke="#ffd1e6" stroke-width="3"/>
      <path d="${heartPath}" transform="translate(201 276) scale(.42)" fill="#fff3b7" stroke="#d1874e" stroke-width="2"/>`,
    wand: `<path d="M64 258 41 204" stroke="#8a5bc9" stroke-width="5" stroke-linecap="round"/>
      <path d="M64 258 41 204" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>
      <path d="m39 178 6 13 15 2-11 10 3 15-13-7-13 7 3-15-11-10 15-2Z" fill="#ffdb7b" stroke="#c07a3e" stroke-width="2"/>
      ${spark(22, 176, .5, '#fff7c4')}${spark(62, 186, .38, '#ffc3e1')}`
  };

  const extraBoxes = { glasses: '48 104 164 56', freckles: '56 132 148 40', bag: '172 236 58 58', wand: '10 166 64 96' };

  /* ---------- Кукла ---------- */

  const haircuts = [
    {
      back: 'M130 30C88 17 50 43 43 80c-6 29 0 47-14 73-9 16 3 30 18 25-3 15 14 26 31 17 17 17 86 17 103-1 20 11 37-1 32-17 16 6 27-11 16-26-16-24-9-49-17-75-10-33-45-56-82-46Z',
      front: 'M49 120C28 77 58 31 101 26c23-7 42-1 51 2 39-2 75 28 66 83-18-7-40-22-53-45-16 27-62 47-110 44l-6 10Z',
      shine: 'M55 80q28-39 79-39M65 91q42-8 74-39m36-2q29 14 33 44M45 126q-1 24-10 37m180-38q1 24 10 36'
    },
    {
      back: 'M130 31C78 17 43 51 42 91c-6 18-12 52 1 66 6 9 20 10 37 3 29 23 73 23 103 0 15 8 29 5 36-6 8-13 3-45-1-64-2-42-38-72-88-59Z',
      front: 'M46 120C28 74 60 33 103 26c25-6 57-2 77 8 31 13 43 40 37 84-19-2-33-18-37-39-25 18-72 23-113 16l-13 22Z',
      shine: 'M55 77q29-43 92-40M64 86q54 9 101-24m22-8q22 17 23 42M44 117q-5 17 2 31m170-26q4 18-1 27'
    },
    {
      back: 'M78 57C50 27 13 47 13 82c-15 14-9 39 6 48-8 15-1 32 17 34 3 13 27 12 43-4h102c16 16 40 17 43 4 18-2 25-19 17-34 15-9 21-34 6-48 0-35-37-55-65-25Z',
      front: 'M51 117C33 72 62 33 103 25c17-4 36-4 54 0 44 9 71 53 52 92-17-8-27-25-32-46-9 20-26 31-47 35 5-9 4-19-1-27-19 20-44 25-69 25Z',
      shine: 'M57 81q20-36 63-44m24 1q43 5 60 47M22 79q9-28 41-21m-46 52q16 14 30-6m191-25q-9-28-41-21m46 52q-16 14-30-6'
    }
  ];

  function eyeMarkup(fill) {
    return `<g transform="translate(92 128) rotate(-8)"><g class="eye-blink">
      <path d="M-24-4q-8-1-10-7m11 5q-6-4-5-10m8 9q-4-4-3-10" fill="none" stroke="#40223f" stroke-width="2.9" stroke-linecap="round"/>
      <path d="M-24 0C-23-24 20-27 24-1c3 24-49 27-48 1Z" fill="#fffafd" stroke="#63344e" stroke-width="2"/>
      <ellipse cx="1.5" cy="-1" rx="17.1" ry="19" fill="${fill}"/>
      <ellipse cx="2" cy="-3.4" rx="10.4" ry="13.5" fill="#2d233d"/>
      <ellipse cx="-3.8" cy="-10" rx="6.4" ry="5.6" fill="#fff"/>
      <circle cx="10.3" cy="4.9" r="3" fill="#fff"/>
      <path d="m-8 4 1.5 3 3 .4-2.2 2 .6 3-2.9-1.6-2.9 1.6.6-3-2.2-2 3-.4Z" fill="#fff" opacity=".85"/>
      <path d="M-13 7q8 15 21 7" fill="none" stroke="#fff" opacity=".5" stroke-width="2" stroke-linecap="round"/>
      <path d="M-24-2q6-19 26-18 15 0 22 15" fill="none" stroke="#40223f" stroke-width="3.8" stroke-linecap="round"/>
    </g></g>`;
  }

  /* outfit — объект с готовыми предметами: { dress, shoe, hair, accessory, extra } */
  function dollArt(doll, outfit, key) {
    const id = name => `d-${key}-${name}`;
    const fill = name => `url(#${id(name)})`;
    const hairItem = outfit.hair;
    const hair = haircuts[hairItem.shape % haircuts.length];
    const shadow = last(doll.hair);
    const eye = eyeMarkup(fill('iris'));
    const acc = outfit.accessory;
    let accTransform = acc.anchor === 'top' ? 'translate(130 27)' : 'translate(183 51) rotate(18) scale(.85)';
    if (acc.anchor === 'top' && hairItem.bun) accTransform = 'translate(130 6)';
    if (acc.shape === 'tiara') accTransform = hairItem.bun ? 'translate(130 18) scale(.8)' : 'translate(130 34) scale(.9)';
    const extra = outfit.extra ? (extras[outfit.extra.shape] || '') : '';
    return `<svg class="doll-art" viewBox="0 0 260 366" aria-hidden="true">
      <defs>
        ${gradient(id('skin'), doll.skin, true)}
        ${gradient(id('hair'), doll.hair, true)}
        ${gradient(id('back'), [doll.hair[1], shadow])}
        ${gradient(id('iris'), doll.eyes)}
        ${gradient(id('dress'), outfit.dress.colors)}
        <radialGradient id="${id('blush')}"><stop stop-color="#f36392" stop-opacity=".6"/><stop offset="1" stop-color="#f36392" stop-opacity="0"/></radialGradient>
      </defs>
      <ellipse cx="130" cy="353" rx="63" ry="8" fill="#50304f" opacity=".15"/>
      <path d="${hair.back}" fill="${fill('back')}" stroke="${shadow}" stroke-width="3"/>
      ${hairItem.bun ? `<circle cx="130" cy="24" r="27" fill="${fill('hair')}" stroke="${shadow}" stroke-width="2.5"/><path d="M112 16q12-14 30-6" fill="none" stroke="#fff2fa" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>` : ''}
      ${hairItem.pigtails ? `<path d="M21 77q13-33 47-17l-7 62q-23 20-39 0-14-20-1-45Zm218 0q-13-33-47-17l7 62q23 20 39 0 14-20 1-45Z" fill="${fill('hair')}" opacity=".9"/>` : ''}
      <g fill="${fill('skin')}" stroke="#9b5e66" stroke-opacity=".56" stroke-width="2.2" stroke-linejoin="round">
        <path d="M97 273q15 0 24 12l-6 50q-10 10-23 2l-3-49Z"/>
        <path d="M163 273q-15 0-24 12l6 50q10 10 23 2l3-49Z"/>
        <path d="M102 192q-11-2-17 14l-14 30-10 7q-5 4-2 9 2 6 8 3l10-8q20-15 30-37Z"/>
        <path d="M158 192q11-2 17 14l14 30 10 7q5 4 2 9-2 6-8 3l-10-8q-20-15-30-37Z"/>
        <path d="M120 170h20l4 24q-14 16-28 0Z"/>
      </g>
      ${shoes(outfit.shoe)}
      ${garment(outfit.dress.shape, fill('dress'))}
      <g fill="${fill('skin')}" stroke="#a9666b" stroke-opacity=".58" stroke-width="2.3">
        <ellipse cx="57" cy="137" rx="11" ry="14"/>
        <ellipse cx="203" cy="137" rx="11" ry="14"/>
        <path d="M130 47c-47 0-78 23-79 65-3 43 28 73 79 73s82-30 79-73c-1-42-32-65-79-65Z"/>
      </g>
      <path d="${hair.front}" fill="${fill('hair')}" stroke="${shadow}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="${hair.shine}" fill="none" stroke="#fff2fa" stroke-opacity=".46" stroke-width="3" stroke-linecap="round"/>
      <path d="M66 106q13-8 24-3m80 0q11-5 24 3" fill="none" stroke="${shadow}" stroke-width="3.6" stroke-linecap="round"/>
      <ellipse cx="76" cy="150" rx="21" ry="13" fill="${fill('blush')}"/>
      <ellipse cx="184" cy="150" rx="21" ry="13" fill="${fill('blush')}"/>
      ${eye}<g transform="translate(260 0) scale(-1 1)">${eye}</g>
      <path d="M126 143q4-4 8 0" fill="none" stroke="#b56f76" stroke-width="2" stroke-linecap="round"/>
      <path d="M119 155q11 5 22 0c-2 13-20 13-22 0Z" fill="#9f3f63" stroke="#c15779" stroke-width="1.6"/>
      <path d="M124 156q6 2 12 0" fill="none" stroke="#fff5ea" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M126 162q4-3 8 0" fill="none" stroke="#ee8aa8" stroke-width="2" stroke-linecap="round"/>
      <g fill="#af5f69" opacity=".57"><circle cx="69" cy="148" r="1.4"/><circle cx="75" cy="150" r="1.1"/><circle cx="81" cy="148" r="1.25"/><circle cx="191" cy="148" r="1.4"/><circle cx="185" cy="150" r="1.1"/><circle cx="179" cy="148" r="1.25"/></g>
      <g fill="#ffdf8a" stroke="#b87559" stroke-width="1"><circle cx="54" cy="150" r="4.2"/><circle cx="206" cy="150" r="4.2"/></g>
      <g transform="${accTransform}">${jewel(acc.shape)}</g>
      ${extra}
      ${spark(62, 65, .41)}${spark(196, 80, .38, '#ffebd0')}
    </svg>`;
  }

  /* ---------- Комната ---------- */

  function balloonArt(item) {
    const shapes = [[39, 64, 23, 29, -13], [69, 42, 23, 30, 9], [97, 67, 22, 27, 17]];
    return shapes.map(([x, y, rx, ry, angle], i) => `<path d="M${x} ${y + ry - 3}q-14 20 15 47t5 35" fill="none" stroke="#98759e" stroke-width="2"/>
      <g transform="rotate(${angle} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${item.colors[i]}" stroke="#644370" stroke-opacity=".27" stroke-width="2"/>
      <path d="M${x - 12} ${y - 7}q2-10 9-13" stroke="#fff" stroke-opacity=".74" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="m${x - 4} ${y + ry + 5} 4-7 4 7Z" fill="${item.colors[i]}"/></g>`).join('');
  }

  function cakeArt(item) {
    const [dark, light, cream] = item.colors;
    return `<ellipse cx="70" cy="108" rx="60" ry="10" fill="#8d5292" opacity=".15"/>
      <path d="M62 93h16v15h-16Z" fill="#e1a9c8"/><ellipse cx="70" cy="107" rx="29" ry="6" fill="#f8cfe4"/>
      <ellipse cx="70" cy="95" rx="59" ry="9" fill="#f5bddc" stroke="#d7a0be" stroke-width="2"/>
      <path d="M20 66h100v22c0 16-100 16-100 0Z" fill="${dark}" stroke="#886285" stroke-opacity=".35" stroke-width="2"/>
      <path d="M20 65c4-11 96-11 100 0v8q-5 7-12 0-9 13-18 2-9 11-20 1-11 10-20-1-9 11-18-2-7 7-12 0Z" fill="${light}"/>
      <path d="M38 42h64v20c0 13-64 13-64 0Z" fill="${dark}"/>
      <path d="M38 42c4-9 60-9 64 0v8q-7 8-14 0-9 11-18 2-9 9-18-2-7 8-14 0Z" fill="${cream}"/>
      <path d="M70 42V24m-15 17V30m30 11V30" fill="none" stroke="#df76ab" stroke-width="5" stroke-linecap="round"/>
      <g class="flame"><path d="M70 20q-9-3 0-13 9 10 0 13Zm-15 6q-6-3 0-10 6 7 0 10Zm30 0q-6-3 0-10 6 7 0 10Z" fill="#ffbe54"/></g>
      ${spark(29, 36, .48, '#ffd786')}${spark(111, 34, .62, '#ffd786')}`;
  }

  const cakeStand = '<path d="M23 117h94l-9 61H32Z" fill="#d7acd9"/><path d="M34 117h72l-8 59H42Z" fill="#f0cce9"/><ellipse cx="70" cy="117" rx="60" ry="10" fill="#fbe8f5"/>';

  const garlandShapes = ['<path d="M-16 0h32L0 31Z"/>', '<path d="M0 28C-28 12-15-11 0 5 15-11 28 12 0 28Z"/>', '<path d="m0 0 5 9 11 1-8 8 2 11-10-5-10 5 2-11-8-8 11-1Z"/>'];

  function garlandArt(item) {
    return `<path d="M12 14q188 108 376 0" fill="none" stroke="#976391" stroke-width="3" stroke-linecap="round"/>
      ${[36, 84, 132, 180, 228, 276, 324, 372].map((x, i) => {
        const y = 68 - Math.pow((x - 200) / 188, 2) * 54;
        const tilt = (200 - x) / 5;
        return `<g transform="translate(${x} ${y}) rotate(${tilt})" fill="${item.colors[i % 3]}" stroke="#765181" stroke-opacity=".22" stroke-width="1.5">${garlandShapes[item.shape % garlandShapes.length]}</g>`;
      }).join('')}`;
  }

  function petArt(item) {
    const [fur, accent] = item.colors;
    const eyes = '<g fill="#3a2440"><ellipse cx="50" cy="48" rx="4.5" ry="5.5"/><ellipse cx="70" cy="48" rx="4.5" ry="5.5"/></g><g fill="#fff"><circle cx="51.5" cy="46" r="1.7"/><circle cx="71.5" cy="46" r="1.7"/></g>';
    const cheeks = `<ellipse cx="42" cy="58" rx="6" ry="4" fill="${accent}" opacity=".7"/><ellipse cx="78" cy="58" rx="6" ry="4" fill="${accent}" opacity=".7"/>`;
    const body = `<ellipse cx="60" cy="86" rx="30" ry="21" fill="${fur}" stroke="#7d5a86" stroke-opacity=".4" stroke-width="2"/><ellipse cx="60" cy="90" rx="15" ry="11" fill="#fff" opacity=".6"/>`;
    const head = `<ellipse cx="60" cy="50" rx="30" ry="26" fill="${fur}" stroke="#7d5a86" stroke-opacity=".4" stroke-width="2"/>`;
    const mouth = '<path d="M60 57v3m-5 1q5 4 5-1 0 5 5 1" fill="none" stroke="#7d4a5e" stroke-width="1.8" stroke-linecap="round"/><path d="m57 54 3 3 3-3Z" fill="#e8739f"/>';
    const shadow = '<ellipse cx="60" cy="106" rx="34" ry="4" fill="#50304f" opacity=".14"/>';
    if (item.shape === 'bunny') {
      return `${shadow}<g fill="${fur}" stroke="#7d5a86" stroke-opacity=".4" stroke-width="2"><ellipse cx="46" cy="16" rx="8" ry="20" transform="rotate(-10 46 16)"/><ellipse cx="74" cy="16" rx="8" ry="20" transform="rotate(10 74 16)"/></g>
        <g fill="${accent}"><ellipse cx="46" cy="17" rx="3.5" ry="13" transform="rotate(-10 46 17)"/><ellipse cx="74" cy="17" rx="3.5" ry="13" transform="rotate(10 74 17)"/></g>
        ${body}<circle cx="90" cy="92" r="8" fill="#fff" stroke="#7d5a86" stroke-opacity=".3" stroke-width="2"/>${head}${eyes}${cheeks}${mouth}`;
    }
    if (item.shape === 'puppy') {
      return `${shadow}${body}<path d="M88 84q16-6 12-20" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>${head}
        <ellipse cx="72" cy="40" rx="9" ry="8" fill="${accent}" opacity=".55"/>
        <g fill="${accent}" stroke="#7d5a86" stroke-opacity=".4" stroke-width="2"><ellipse cx="31" cy="50" rx="9" ry="17" transform="rotate(14 31 50)"/><ellipse cx="89" cy="50" rx="9" ry="17" transform="rotate(-14 89 50)"/></g>
        ${eyes}${cheeks}<ellipse cx="60" cy="56" rx="5" ry="3.5" fill="#3a2440"/><path d="M55 62q5 4 10 0" fill="none" stroke="#7d4a5e" stroke-width="1.8" stroke-linecap="round"/><path d="M57 64q3 6 6 0Z" fill="#ff8fb3"/>`;
    }
    return `${shadow}<path d="M86 92q22-4 16-28" fill="none" stroke="${fur}" stroke-width="9" stroke-linecap="round"/><path d="M86 92q22-4 16-28" fill="none" stroke="#7d5a86" stroke-opacity=".25" stroke-width="11" stroke-linecap="round" style="mix-blend-mode:multiply"/>
      ${body}<g fill="${fur}" stroke="#7d5a86" stroke-opacity=".4" stroke-width="2" stroke-linejoin="round"><path d="m34 38 2-22 18 12Z"/><path d="m86 38-2-22-18 12Z"/></g>
      <g fill="${accent}"><path d="m38 33 1-11 9 7Z"/><path d="m82 33-1-11-9 7Z"/></g>${head}${eyes}${cheeks}${mouth}
      <path d="M30 55h-12m12 4-11 3m71-7h12m-12 4 11 3" stroke="#a07aa8" stroke-width="1.5" stroke-linecap="round"/>
      <path d="${heartPath}" transform="translate(60 74) scale(.3)" fill="${accent}"/>`;
  }

  /* Картинка предмета в комнате (большая, на сцене) */
  function propArt(categoryId, item) {
    switch (categoryId) {
      case 'garland': return picture('0 0 400 102', garlandArt(item));
      case 'balloon': return picture('4 8 126 171', balloonArt(item));
      case 'cake': return picture('0 0 140 183', cakeStand + cakeArt(item));
      case 'pet': return picture('0 0 120 110', petArt(item));
      default: return '';
    }
  }

  /* Маленькая картинка на кнопке выбора */
  function swatchArt(categoryId, item, doll) {
    switch (categoryId) {
      case 'dress': return picture('57 184 146 128', garment(item.shape, item.colors[1]));
      case 'shoe': return picture('75 310 110 47', shoes(item));
      case 'hair': {
        const cut = haircuts[item.shape % haircuts.length];
        return picture('0 -8 260 202', `<path d="${cut.back}" fill="${doll.hair[1]}"/>${item.bun ? `<circle cx="130" cy="24" r="27" fill="${doll.hair[1]}"/>` : ''}${item.pigtails ? `<path d="M21 77q13-33 47-17l-7 62q-23 20-39 0-14-20-1-45Zm218 0q-13-33-47-17l7 62q23 20 39 0 14-20 1-45Z" fill="${doll.hair[0]}"/>` : ''}<ellipse cx="130" cy="112" rx="74" ry="69" fill="${doll.skin[0]}"/><path d="${cut.front}" fill="${doll.hair[0]}" stroke="${last(doll.hair)}" stroke-width="5"/><circle cx="102" cy="129" r="9" fill="#643a66"/><circle cx="158" cy="129" r="9" fill="#643a66"/><path d="M120 149q10 11 20 0" stroke="#bb547c" stroke-width="5" fill="none" stroke-linecap="round"/>`);
      }
      case 'accessory': return picture(item.shape === 'tiara' ? '-40 -26 80 42' : '-34 -30 68 57', jewel(item.shape));
      case 'extra': {
        const face = item.shape === 'glasses' || item.shape === 'freckles' ? `<rect x="40" y="96" width="180" height="80" rx="30" fill="${doll.skin[0]}"/>` : '';
        return picture(extraBoxes[item.shape], face + (extras[item.shape] || ''));
      }
      case 'wall': {
        const c = item.colors;
        return picture('0 0 70 52', `<rect x="6" y="5" width="58" height="42" rx="9" fill="${c[0]}" stroke="${c[1]}" stroke-width="3"/><path d="M7 35h56" stroke="${c[1]}" stroke-width="3"/>${spark(35, 21, 1, item.night ? '#ffe9a3' : '#fff')}${item.night ? spark(17, 14, .4, '#fff') + spark(53, 27, .35, '#fff') : ''}`);
      }
      case 'balloon': return picture('8 7 118 121', balloonArt(item));
      case 'cake': return picture('8 2 124 112', cakeArt(item));
      case 'garland': return picture('104 8 192 96', garlandArt(item));
      case 'pet': return picture('8 -6 104 116', petArt(item));
      default: return '';
    }
  }

  MP.art = { icon, spark, picture, dollArt, propArt, swatchArt, heartPath };
})(window.MP = window.MP || {});
