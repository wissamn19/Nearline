const input = document.querySelector('#myInput');

const preview = document.querySelector('#preview');

// Shows where the text will land, before you press Enter.
function updatePreview() {
  const text = input.value.trim();
  if (!text) { preview.hidden = true; return; }
  const type = classifyInput(text).type;
  preview.textContent = 'Files as ' + type[0].toUpperCase() + type.slice(1);
  preview.style.setProperty('--c', 'var(--' + type + ')');
  preview.hidden = false;
}

const lists = {
  task: document.querySelector('#tasksList'),
  note: document.querySelector('#notesList'),
  link: document.querySelector('#linksList')
};

// Older saved items stored CSS selectors as their type. Convert them once on load.
const OLD_TYPES = { '#tasksList': 'task', '#notesList': 'note', '#linksList': 'link' };

function loadItems() {
  const saved = JSON.parse(localStorage.getItem('items')) || [];
  return saved.map(function (item) {
    return {
      ...item,
      type: OLD_TYPES[item.type] || item.type,
      remindAt: typeof item.remindAt === 'number' ? item.remindAt : null
    };
  });
}

let items = loadItems();

function saveItems() {
  localStorage.setItem('items', JSON.stringify(items));
}

/* ---------- Classify and create ---------- */

function classifyInput(text) {
  if (/^(https?:\/\/|www\.)/i.test(text)) {
    return { type: 'link', text };
  }
  if (text.startsWith('!')) {
    return { type: 'note', text: text.slice(1).trim() };
  }
  return { type: 'task', text };
}

function parseReminder(text) {
  const regex = /@(\d{1,2}):(\d{2})/;
  const match = text.match(regex);
  if (!match) return { text, remindAt: null };

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return { text, remindAt: null };

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);

  return { text: text.replace(regex, '').trim(), remindAt: d.getTime() };
}

function createItem(text, type) {
  const reminder = parseReminder(text);
  return {
    id: Date.now() + Math.random(),
    text: reminder.text || text,
    type: type,
    status: 'todo',
    createdAt: Date.now(),
    remindAt: reminder.remindAt,
    reminded: false
  };
}

/* ---------- Render ---------- */

function linkHref(text) {
  return /^https?:\/\//i.test(text) ? text : 'https://' + text;
}

function domainOf(href) {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch (err) {
    return '';
  }
}

function updateCounts() {
  document.querySelectorAll('.lane').forEach(function (lane) {
    const type = lane.dataset.type;
    const mine = items.filter(function (i) { return i.type === type; });
    const done = mine.filter(function (i) { return i.status === 'done'; }).length;
    // Tasks show progress (done/total), the rest show a plain count.
    lane.querySelector('.count').textContent =
      type === 'task' && mine.length ? done + '/' + mine.length : mine.length;
  });
}

function pulseNode(type) {
  const node = document.querySelector('.lane[data-type="' + type + '"] .node');
  node.classList.remove('pulse');
  void node.offsetWidth; // restart the animation
  node.classList.add('pulse');
}

const timeline = document.querySelector('.timeline');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const narrow = window.matchMedia('(max-width: 760px)');

const roadSvg = document.querySelector('.road');
const roadPath = document.querySelector('#roadPath');

// Finds how far along the path the road reaches a given x position.
function lengthAtX(path, x) {
  let lo = 0;
  let hi = path.getTotalLength();
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).x < x) lo = mid; else hi = mid;
  }
  return hi;
}

// A dot drives along the road from the start to the node that owns the item.
function driveTo(type) {
  const node = document.querySelector('.lane[data-type="' + type + '"] .node');
  if (reduceMotion.matches) { pulseNode(type); return; }

  const car = document.createElement('div');
  car.className = 'car';
  car.style.background = 'var(--' + type + ')';
  timeline.appendChild(car);

  const frames = [];
  let duration = 600;

  if (narrow.matches) {
    const x = 34 - 9;
    const y1 = 40 - 9;
    const y2 = node.offsetTop + node.offsetHeight / 2 - 9;
    frames.push({ transform: 'translate(' + x + 'px,' + y1 + 'px)' });
    frames.push({ transform: 'translate(' + x + 'px,' + y2 + 'px)' });
  } else {
    const svgW = roadSvg.offsetWidth;
    const svgH = roadSvg.offsetHeight;
    const centerX = node.offsetLeft + node.offsetWidth / 2 - roadSvg.offsetLeft;
    const end = lengthAtX(roadPath, centerX * 1000 / svgW);
    for (let i = 0; i <= 40; i++) {
      const p = roadPath.getPointAtLength(end * i / 40);
      const x = roadSvg.offsetLeft + p.x * svgW / 1000 - 9;
      const y = roadSvg.offsetTop + p.y * svgH / 150 - 9;
      frames.push({ transform: 'translate(' + x + 'px,' + y + 'px)' });
    }
    duration = 500 + (end / 1000) * 700;
  }

  const run = car.animate(frames, { duration: duration, easing: 'linear', fill: 'forwards' });
  run.onfinish = function () {
    car.remove();
    pulseNode(type);
  };
}

function renderItem(item, isNew) {
  const list = lists[item.type];
  if (!list) return;

  const li = document.createElement('li');
  li.className = 'item';
  li.classList.toggle('done', item.status === 'done');
  if (isNew) li.classList.add('drop');

  if (item.type === 'task') {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.status === 'done';
    checkbox.setAttribute('aria-label', 'Mark task done');
    checkbox.addEventListener('change', function () {
      item.status = checkbox.checked ? 'done' : 'todo';
      li.classList.toggle('done', checkbox.checked);
      saveItems();
      updateCounts();
    });
    li.appendChild(checkbox);
  }

  const body = document.createElement('div');
  body.className = 'body';

  if (item.type === 'link') {
    const href = linkHref(item.text);
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = item.text;
    body.appendChild(a);

    const domain = domainOf(href);
    if (domain) {
      const small = document.createElement('span');
      small.className = 'domain';
      small.textContent = domain;
      body.appendChild(small);
    }
  } else {
    body.appendChild(document.createTextNode(item.text));
  }

  if (item.remindAt !== null && !item.reminded) {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = new Date(item.remindAt)
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    body.appendChild(chip);
  }

  li.appendChild(body);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'del';
  del.textContent = '\u00D7';
  del.setAttribute('aria-label', 'Delete');
  del.addEventListener('click', function () {
    items = items.filter(function (entry) { return entry.id !== item.id; });
    saveItems();
    li.remove();
    updateCounts();
  });
  li.appendChild(del);

  list.prepend(li);
  if (isNew) driveTo(item.type);
}

/* ---------- Capture ---------- */

function askPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// forcedType comes from clicking a node. Without it, the text is auto-sorted.
function captureText(raw, forcedType) {
  const clean = raw.trim();
  if (!clean) return false;

  let type = forcedType;
  let text = clean;
  if (!type) {
    const result = classifyInput(clean);
    type = result.type;
    text = result.text;
  }
  if (!text) return false;

  const item = createItem(text, type);
  items.push(item);
  saveItems();
  renderItem(item, true);
  updateCounts();
  askPermission();
  return true;
}

input.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  if (captureText(input.value)) input.value = '';
  updatePreview();
});

input.addEventListener('input', updatePreview);

const examples = ["What's on your mind?", 'buy milk', '!idea for the landing page', 'call mom @17:30', 'https://github.com'];
let exampleIndex = 0;
setInterval(function () {
  if (input.value) return;
  exampleIndex = (exampleIndex + 1) % examples.length;
  input.placeholder = examples[exampleIndex];
}, 2800);

// Press / anywhere to jump to the capture bar.
document.addEventListener('keydown', function (e) {
  if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
    e.preventDefault();
    input.focus();
  }
});

document.querySelectorAll('.lane').forEach(function (lane) {
  const node = lane.querySelector('.node');
  const field = lane.querySelector('.node-input');

  node.addEventListener('click', function () {
    field.hidden = !field.hidden;
    if (!field.hidden) field.focus();
  });

  field.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      field.hidden = true;
      node.focus();
      return;
    }
    if (e.key !== 'Enter') return;
    if (captureText(field.value, lane.dataset.type)) field.value = '';
  });
});

/* ---------- Reminders ---------- */

function notify(text) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Nearline', { body: text });
  } else {
    alert('Reminder: ' + text);
  }
}

function checkReminders() {
  const now = Date.now();
  items.forEach(function (item) {
    const isDue = item.remindAt !== null && item.remindAt <= now;
    if (isDue && item.status !== 'done' && !item.reminded) {
      notify(item.text);
      item.reminded = true;
      saveItems();
    }
  });
}

/* ---------- Start ---------- */

items.forEach(function (item) { renderItem(item, false); });
updateCounts();
checkReminders();
setInterval(checkReminders, 30000);