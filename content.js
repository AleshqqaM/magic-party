'use strict';
/*
 * Весь контент игры — здесь. Чтобы добавить предмет, допишите строку в нужный список `items`.
 * Поля:
 *   id     — уникальное имя латиницей (по нему сохраняется игра, не меняйте у существующих);
 *   name   — как назвать вслух;
 *   shape  — какую готовую форму из art.js взять (номер или имя);
 *   colors — цвета: светлый, основной, тёмный (для платьев, шариков, тортов...).
 * Новые формы (новый фасон, новая причёска) рисуются в art.js, всё остальное — только здесь.
 */
(function (MP) {
  MP.content = {
    dolls: [
      { id: 'mila', name: 'Мила', role: 'Принцесса', theme: 'rose',
        skin: ['#fff0d7', '#f3a38c'], hair: ['#ffc4de', '#ed70b0', '#a73883'], eyes: ['#347ba9', '#7cdeea'],
        defaults: { dress: 'rose', shoe: 'rose', hair: 'curls', accessory: 'crown', extra: 'none' } },
      { id: 'viola', name: 'Виола', role: 'Модница', theme: 'lilac',
        skin: ['#f7c9a3', '#b87861'], hair: ['#e2baff', '#a16ce0', '#56318a'], eyes: ['#7752b4', '#cba5ff'],
        defaults: { dress: 'lilac', shoe: 'lilac', hair: 'bob', accessory: 'bow', extra: 'none' } },
      { id: 'raduga', name: 'Радуга', role: 'Фантазёрка', theme: 'mint',
        skin: ['#ffdebf', '#da8e79'], hair: ['#ffc1df', '#ed83c0', '#b193fa', '#7adddf', '#526caa'], eyes: ['#2c8278', '#83e0b6'],
        defaults: { dress: 'mint', shoe: 'mint', hair: 'tails', accessory: 'star', extra: 'none' } },
      { id: 'lana', name: 'Лана', role: 'Звёздочка', theme: 'sky',
        skin: ['#b98262', '#7a4a37'], hair: ['#9fd8ff', '#4f7fe0', '#2b3b8f'], eyes: ['#7a4b2a', '#e8b46a'],
        defaults: { dress: 'gold', shoe: 'sky', hair: 'bun', accessory: 'heart', extra: 'glasses' } }
    ],

    wardrobe: [
      { id: 'dress', label: 'Платье', icon: 'dress', sound: 'dress', items: [
        { id: 'rose',   name: 'Розовое платье',    shape: 0, colors: ['#ffe3f3', '#f68bc4', '#c93f89'] },
        { id: 'lilac',  name: 'Сиреневое платье',  shape: 1, colors: ['#f6e2ff', '#bb89fa', '#794fbb'] },
        { id: 'mint',   name: 'Бирюзовое платье',  shape: 2, colors: ['#dafff8', '#80dacc', '#29969e'] },
        { id: 'gold',   name: 'Золотое платье',    shape: 3, colors: ['#fff5be', '#ffcb76', '#d7834d'] },
        { id: 'coral',  name: 'Коралловое платье', shape: 1, colors: ['#ffe6dc', '#ff9b85', '#d2523e'] },
        { id: 'sky',    name: 'Небесное платье',   shape: 0, colors: ['#e3f3ff', '#8cc6ff', '#3d79c9'] },
        { id: 'berry',  name: 'Ягодное платье',    shape: 2, colors: ['#ffd9ec', '#e04d97', '#8e1f5c'] },
        { id: 'star',   name: 'Звёздное платье',   shape: 3, colors: ['#e9e4ff', '#6f62d9', '#2f2786'] }
      ]},
      { id: 'shoe', label: 'Обувь', icon: 'shoe', sound: 'shoe', items: [
        { id: 'rose',  name: 'Розовые туфельки',   shape: 0, color: '#d85599' },
        { id: 'lilac', name: 'Сиреневые сапожки',  shape: 1, color: '#8055b9' },
        { id: 'mint',  name: 'Бирюзовые кеды',     shape: 2, color: '#249e94' },
        { id: 'gold',  name: 'Золотые туфельки',   shape: 0, color: '#e2a03f' },
        { id: 'sky',   name: 'Голубые сапожки',    shape: 1, color: '#4a8ee0' },
        { id: 'white', name: 'Белые кеды',         shape: 2, color: '#f4eef8' }
      ]},
      { id: 'hair', label: 'Причёска', icon: 'hair', sound: 'hair', items: [
        { id: 'curls', name: 'Длинные локоны', shape: 0 },
        { id: 'bob',   name: 'Каре',           shape: 1 },
        { id: 'tails', name: 'Два хвостика',   shape: 2, pigtails: true },
        { id: 'bun',   name: 'Пучок',          shape: 1, bun: true }
      ]},
      { id: 'accessory', label: 'Украшение', icon: 'crown', sound: 'bell', items: [
        { id: 'crown',  name: 'Корона',      shape: 'crown',  anchor: 'top' },
        { id: 'bow',    name: 'Бант',        shape: 'bow',    anchor: 'side' },
        { id: 'star',   name: 'Звёздочка',   shape: 'star',   anchor: 'side' },
        { id: 'flower', name: 'Цветок',      shape: 'flower', anchor: 'side' },
        { id: 'heart',  name: 'Сердечко',    shape: 'heart',  anchor: 'side' },
        { id: 'tiara',  name: 'Диадема',     shape: 'tiara',  anchor: 'top' }
      ]},
      { id: 'extra', label: 'Ещё', icon: 'glasses', sound: 'sparkle', optional: true, items: [
        { id: 'glasses', name: 'Очки-сердечки', shape: 'glasses' },
        { id: 'stars',   name: 'Блёстки на щёчках', shape: 'freckles' },
        { id: 'bag',     name: 'Сумочка',     shape: 'bag' },
        { id: 'wand',    name: 'Волшебная палочка', shape: 'wand' }
      ]}
    ],

    decoration: [
      { id: 'wall', label: 'Комната', icon: 'paint', sound: 'paint', items: [
        { id: 'pink',  name: 'Розовая комната',     colors: ['#ffe1ee', '#f6aace', '#fff0f6', '#eec4da'] },
        { id: 'lilac', name: 'Сиреневая комната',   colors: ['#eee5ff', '#beaaea', '#faf2ff', '#d3bee7'] },
        { id: 'mint',  name: 'Бирюзовая комната',   colors: ['#ddf9ef', '#99d9ca', '#effef7', '#b4dcd4'] },
        { id: 'gold',  name: 'Золотистая комната',  colors: ['#fff1cb', '#edbc82', '#fff9e8', '#efd0ae'] },
        { id: 'night', name: 'Звёздная комната',    colors: ['#3c3577', '#7b6fd0', '#5a4f9e', '#8f84e0'], night: true }
      ]},
      { id: 'balloon', label: 'Шарики', icon: 'balloons', sound: 'pop', optional: true, items: [
        { id: 'pink',  name: 'Розовые шарики',   colors: ['#f693bc', '#bc9cf0', '#f8cb78'] },
        { id: 'lilac', name: 'Сиреневые шарики', colors: ['#b18ce9', '#9ac5ff', '#f8add4'] },
        { id: 'mint',  name: 'Бирюзовые шарики', colors: ['#77d4c6', '#ffcf81', '#80c7e9'] },
        { id: 'red',   name: 'Яркие шарики',     colors: ['#ff6b81', '#ffd25c', '#5ccfff'] }
      ]},
      { id: 'cake', label: 'Торт', icon: 'cake', sound: 'yum', optional: true, items: [
        { id: 'strawberry', name: 'Клубничный торт', colors: ['#ef87b8', '#ffcee4', '#fff0da'] },
        { id: 'blueberry',  name: 'Черничный торт',  colors: ['#ad82dc', '#e4c3fb', '#fff0d8'] },
        { id: 'mint',       name: 'Мятный торт',     colors: ['#70c4b6', '#c5f3df', '#fff2bd'] },
        { id: 'choco',      name: 'Шоколадный торт', colors: ['#8b5a44', '#e8c3a8', '#fff0da'] }
      ]},
      { id: 'garland', label: 'Гирлянда', icon: 'garland', sound: 'tinkle', optional: true, items: [
        { id: 'flags',  name: 'Флажки',     shape: 0, colors: ['#f693bc', '#bc9cf0', '#f8cb78'] },
        { id: 'hearts', name: 'Сердечки',   shape: 1, colors: ['#b18ce9', '#9ac5ff', '#f8add4'] },
        { id: 'stars',  name: 'Звёздочки',  shape: 2, colors: ['#77d4c6', '#ffcf81', '#80c7e9'] },
        { id: 'rainbow',name: 'Радужные флажки', shape: 0, colors: ['#ff6b81', '#ffd25c', '#5ccfff'] }
      ]},
      { id: 'pet', label: 'Питомец', icon: 'paw', sound: 'pet', optional: true, items: [
        { id: 'kitty', name: 'Котёнок', shape: 'kitty', colors: ['#fff4f8', '#f7b6d2'] },
        { id: 'bunny', name: 'Зайка',   shape: 'bunny', colors: ['#ffffff', '#c9b8f5'] },
        { id: 'puppy', name: 'Щенок',   shape: 'puppy', colors: ['#ffe2b8', '#c98a5a'] }
      ]}
    ],

    // Что говорит голос. Ключ — экран.
    voice: {
      dolls: 'Выбери куклу!',
      wardrobe: 'Наряди куклу! Нажимай на картинки.',
      room: 'Теперь укрась комнату к празднику!',
      party: 'Ура! Праздник! Нажимай на звёздочки и на куклу!',
      confirm: 'Начать заново?',
      surprise: 'Сюрприз!',
      none: 'Убрали'
    }
  };
})(window.MP = window.MP || {});
