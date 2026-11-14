const field = document.querySelector('#try');
const tag = document.querySelector('#tryTag');
const why = document.querySelector('#tryWhy');
const DEFAULT_HINT = why.textContent;
const CUTOFF = 0.4;   // same cutoff as the app

// The same rules as the app: link pattern, then "!", then the model.
function decide(text) {
  if (/^(https?:\/\/|www\.)/i.test(text)) {
    return { type: 'link', why: 'It matches a link pattern, so a rule files it. No guessing.' };
  }
  if (text.startsWith('!')) {
    return { type: 'note', why: 'It starts with !, so it is a note. Your choice always wins.' };
  }
  if (typeof pTask !== 'function') {
    return { type: 'task', why: 'The model did not load, so everything defaults to a task.' };
  }
  const p = pTask(text.replace(/@\d{1,2}:\d{2}/, '').trim() || text);
  if (!Number.isFinite(p)) return { type: 'task', why: 'The model did not load, so everything defaults to a task.' };
  const type = p >= CUTOFF ? 'task' : 'note';
  return {
    type: type,
    why: 'The model says ' + Math.round(p * 100) + '% task. Under ' + Math.round(CUTOFF * 100) + '% it becomes a note.'
  };
}

function update() {
  const text = field.value.trim();
  if (!text) {
    tag.hidden = true;
    why.textContent = DEFAULT_HINT;
    return;
  }
  const result = decide(text);
  tag.textContent = 'Files as ' + result.type[0].toUpperCase() + result.type.slice(1);
  tag.style.setProperty('--c', 'var(--' + result.type + ')');
  tag.hidden = false;
  why.textContent = result.why;
}

field.addEventListener('input', update);

document.querySelectorAll('.ex').forEach(function (button) {
  button.addEventListener('click', function () {
    field.value = button.dataset.text;
    update();
    field.focus();
  });
});