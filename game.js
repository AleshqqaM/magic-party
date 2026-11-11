'use strict';

const game = document.querySelector('#game');
const stepList = document.querySelector('.steps');
const soundButton = document.querySelector('.sound');

const steps = [
  ['Кукла','person'], ['Наряд','dress'], ['Комната','room'], ['Праздник','party']
];
const wardrobe = [
  ['dress','Платье','dress',['Розовое платье','Сиреневое платье','Бирюзовое платье','Золотое платье']],
  ['shoe','Обувь','shoe',['Розовые туфельки','Сиреневые сапожки','Бирюзовые кеды']],
  ['hair','Причёска','hair',['Длинные локоны','Каре','Два хвостика']],
  ['accessory','Аксессуар','crown',['Корона','Бант','Звёздочка','Цветок']]
];
const decoration = [
  ['wall','Цвет комнаты','paint',['Розовая комната','Сиреневая комната','Бирюзовая комната','Золотистая комната']],
  ['balloon','Шарики','balloons',['Розовые шарики','Сиреневые шарики','Бирюзовые шарики']],
  ['cake','Торт','cake',['Клубничный торт','Черничный торт','Мятный торт']],
  ['garland','Украшения','garland',['Флажки','Сердечки','Звёздочки']]
];
const defaults = index => ({ dress: index, shoe: index, hair: index, accessory: index });
const newRoom = () => ({wall: 0, balloon: null, cake: null, garland: null});
let outfits = dolls.map((_,index) => defaults(index));
let room = newRoom();
let selectedDoll = 0;
let screen = 0;
let soundOn = true;
let audio;
const voices = new Set();

try { soundOn = localStorage.getItem('magic-party-sound') !== 'off'; } catch { /* File storage is optional. */ }

function playSound(kind) {
  const Audio = window.AudioContext || window.webkitAudioContext;
  if (!soundOn || !Audio) return;
  const notes = {
    tap: [523.25, 659.25],
    outfit: [659.25, 783.99, 987.77],
    party: [523.25, 659.25, 783.99, 1046.5, 880, 987.77, 1046.5]
  }[kind];
  try {
    audio ??= new Audio();
    if (audio.state === 'suspended' || audio.state === 'interrupted') audio.resume().catch(() => {});
    const start = audio.currentTime;
    const spacing = kind === 'party' ? .15 : .065;
    notes.forEach((frequency,index) => {
      const time = start + index * spacing;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.001,time);
      gain.gain.exponentialRampToValueAtTime(.08,time+.018);
      gain.gain.exponentialRampToValueAtTime(.001,time+.19);
      oscillator.connect(gain).connect(audio.destination);
      voices.add(oscillator);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        voices.delete(oscillator);
      };
      oscillator.start(time);
      oscillator.stop(time+.2);
    });
  } catch { /* The game is playable when audio is unavailable. */ }
}

function updateSound() {
  soundButton.setAttribute('aria-pressed', String(soundOn));
  soundButton.setAttribute('aria-label', soundOn ? 'Выключить звук' : 'Включить звук');
  soundButton.innerHTML = `${icon(soundOn ? 'sound' : 'mute',21)}<span>${soundOn ? 'Звук' : 'Без звука'}</span>`;
}

function motif(name, className) {
  return `<span class="motif ${className}" aria-hidden="true">${icon(name,32)}</span>`;
}

function dollSelection() {
  const motifs = motif('sparkle','cover-spark') + motif('heart','cover-heart')
    + motif('star','cover-star') + motif('sparkle','cover-tiny');
  return `<section class="selection">
    <div class="selection-header">
      ${motif('sparkle','heading-spark heading-left')}
      <h1 tabindex="-1">Выбери <em>куклу!</em></h1>
      ${motif('sparkle','heading-spark heading-right')}
    </div>
    <div class="doll-grid">${dolls.map((doll,index) => `<button type="button" class="doll-card ${doll.theme}" data-doll="${index}">
      <div class="portrait">${motifs}${dollArt(index,outfits[index],`card${index}`)}</div>
      <div class="doll-caption"><span><strong>${doll.name}</strong><small>${doll.role}</small></span><span class="card-arrow">${icon('next',23)}</span></div>
    </button>`).join('')}</div>
    <div class="footer-hearts" aria-hidden="true">${icon('sparkle',13)}${icon('heart',18)}${icon('sparkle',13)}</div>
  </section>`;
}

function stageArt(type) {
  const color = rooms[room.wall];
  const dressing = type === 'wardrobe';
  if (dressing) {
    return `<div class="dressing-wall"></div><div class="dressing-floor"></div><div class="mirror"></div>
      ${motif('sparkle','stage-spark one')}${motif('heart','stage-spark two')}${motif('sparkle','stage-spark three')}${motif('star','stage-spark four')}`;
  }
  return `<div class="room-walls" style="--wall:${color[0]};--trim:${color[1]};--floor:${color[2]};--line:${color[3]}"></div>
    ${room.garland === null ? '' : `<div class="prop garland">${picture('0 0 400 102',garlandArt(room.garland))}</div>`}
    ${room.balloon === null ? '' : `<div class="prop balloon">${picture('4 8 126 171',balloonArt(room.balloon))}</div>`}
    ${room.cake === null ? '' : `<div class="prop cake">${picture('0 0 140 183',`<path d="M23 117h94l-9 61H32Z" fill="#d7acd9"/><path d="M34 117h72l-8 59H42Z" fill="#f0cce9"/><ellipse cx="70" cy="117" rx="60" ry="10" fill="#fbe8f5"/>${cakeArt(room.cake)}` )}</div>`}`;
}

function confetti() {
  const colors = ['#e267a7','#8a65d7','#39b9aa','#ffc065','#fa98c5'];
  return `<div class="confetti" aria-hidden="true">${Array.from({length:42},(_,i) => `<i style="--x:${(i*37+7)%100}%;--delay:${(i%15)*.13}s;--fall:${2.6+(i%8)*.14}s;--drift:${(i%7-3)*20}px;--color:${colors[i%colors.length]};--round:${i%3 ? '2px' : '50%'}"></i>`).join('')}</div>`;
}

function renderStage(type, changed = false) {
  const stage = document.querySelector('.stage');
  stage.innerHTML = `${stageArt(type)}
    <div class="stage-doll${changed ? ' changed' : ''}" role="img" aria-label="${dolls[selectedDoll].name}">${dollArt(selectedDoll,outfits[selectedDoll],'stage')}</div>
    ${type === 'party' ? `<div class="party-title">Ура!</div>${motif('star','twinkle one')}${motif('sparkle','twinkle two')}${motif('sparkle','twinkle three')}${motif('star','twinkle four')}${confetti()}` : ''}`;
}

function optionsPanel(groups, selection) {
  return `<div class="options">${groups.map(([key,label,glyph,names]) => `<section class="option-group" aria-label="${label}">
    <h2>${icon(glyph,21)}${label}</h2>
    <div class="swatches">${names.map((name,index) => `<button type="button" class="swatch" data-option="${key}" data-value="${index}" aria-label="${name}" aria-pressed="${selection[key] === index}">
      ${swatchArt(key,index,selectedDoll)}<span class="swatch-check">${icon('check',11)}</span>
    </button>`).join('')}</div>
  </section>`).join('')}</div>`;
}

function action(name, label, glyph, kind) {
  return `<button type="button" class="action ${kind}" data-action="${name}">${icon(glyph,23)}<span>${label}</span></button>`;
}

function editor(type) {
  const dressing = type === 'wardrobe';
  return `<section class="workspace editor-${type}">
    <div class="workspace-header"><h1 tabindex="-1">${dressing ? 'Наряди <em>куклу!</em>' : 'Укрась <em>комнату!</em>'}</h1></div>
    <div class="workspace-body">
      <div class="stage ${type}" aria-label="${dressing ? 'Гардероб' : 'Комната'}"></div>
      <div class="controls">
        ${optionsPanel(dressing ? wardrobe : decoration,dressing ? outfits[selectedDoll] : room)}
        <div class="actions">
          ${action('back','Назад','back','secondary')}
          ${dressing ? action('room','В комнату','next','primary') : action('party','Праздник!','party','primary')}
        </div>
      </div>
    </div>
  </section>`;
}

function finale() {
  return `<section class="finale">
    <h1 class="visually-hidden" tabindex="-1">Вечеринка!</h1>
    <div class="stage party" aria-label="Праздничная комната"></div>
    <div class="actions">
      ${action('new','Новая игра','person','secondary')}
      ${action('replay','Ещё праздник!','replay','primary')}
    </div>
  </section>`;
}

function render(focus = true) {
  stepList.innerHTML = steps.map(([name,glyph],index) => `<li class="${index < screen ? 'done' : ''}" ${index === screen ? 'aria-current="step"' : ''}>
    <span>${icon(index < screen ? 'check' : glyph,20)}</span><small>${name}</small>
  </li>`).join('');
  game.innerHTML = [dollSelection, () => editor('wardrobe'), () => editor('room'), finale][screen]();
  if (screen) renderStage(['','wardrobe','room','party'][screen]);
  if (focus) {
    window.scrollTo(0,0);
    game.querySelector('h1').focus({preventScroll:true});
  }
}

soundButton.addEventListener('click', () => {
  soundOn = !soundOn;
  try { localStorage.setItem('magic-party-sound',soundOn ? 'on' : 'off'); } catch { /* Storage may be disabled. */ }
  if (soundOn) playSound('tap');
  else voices.forEach(voice => voice.stop());
  updateSound();
});

game.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const { doll, option, value, action: command } = button.dataset;

  if (doll !== undefined) {
    selectedDoll = Number(doll);
    screen = 1;
  } else if (option) {
    const selection = screen === 1 ? outfits[selectedDoll] : room;
    selection[option] = Number(value);
    button.closest('.swatches').querySelectorAll('button').forEach(choice => {
      choice.setAttribute('aria-pressed', String(choice === button));
    });
    renderStage(screen === 1 ? 'wardrobe' : 'room',screen === 1);
    playSound('outfit');
    return;
  } else {
    switch (command) {
      case 'back': screen -= 1; break;
      case 'room': screen = 2; break;
      case 'party': screen = 3; break;
      case 'replay':
        renderStage('party');
        playSound('party');
        return;
      case 'new':
        outfits = dolls.map((_,index) => defaults(index));
        room = newRoom();
        selectedDoll = 0;
        screen = 0;
        break;
    }
  }
  playSound(screen === 3 ? 'party' : 'tap');
  render();
});

document.querySelector('.brand-mark').innerHTML = icon('heart',27);
updateSound();
render(false);
