'use strict';
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus = false) {
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
  });
});
const dialog = document.getElementById('image-dialog');
const dialogImage = document.getElementById('dialog-image');
const dialogCaption = document.getElementById('dialog-caption');
document.querySelectorAll('[data-zoom]').forEach(button => {
  button.addEventListener('click', () => {
    dialogImage.src = button.dataset.zoom;
    dialogImage.alt = button.querySelector('img').alt;
    dialogCaption.textContent = button.dataset.caption;
    dialog.showModal();
  });
});
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
const taskSearch = document.getElementById('task-search');
const taskCount = document.getElementById('task-count');
const taskRows = [...document.querySelectorAll('#pretraining-rows tr')];
const taskEmpty = document.getElementById('task-empty');
taskSearch.addEventListener('input', () => {
  const query = taskSearch.value.trim().toLocaleLowerCase();
  let count = 0;
  taskRows.forEach(row => {
    const matches = row.textContent.toLocaleLowerCase().includes(query);
    row.hidden = !matches;
    if (matches) count++;
  });
  taskCount.textContent = `${count} of ${taskRows.length} tasks`;
  taskEmpty.hidden = count > 0;
});

const outlineLinks = [...document.querySelectorAll('.outline a')];
const outlineSections = outlineLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
let outlineTick = false;
function updateOutline() {
  let current = outlineSections[0];
  for (const section of outlineSections) if (section.getBoundingClientRect().top <= 150) current = section;
  for (const link of outlineLinks) {
    if (link.getAttribute('href') === '#' + current.id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  outlineTick = false;
}
window.addEventListener('scroll', () => {
  if (!outlineTick) { outlineTick = true; requestAnimationFrame(updateOutline); }
}, {passive: true});
updateOutline();

// Replay measured results without changing their values or source artwork.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const chartAnimations = new WeakMap();
function replayResult(element, frames, options) {
  chartAnimations.get(element)?.cancel();
  if (reducedMotion.matches) return;
  const animation = element.animate(frames, options);
  chartAnimations.set(element, animation);
}
document.querySelectorAll('.bar-row').forEach(row => {
  const label = row.querySelector(':scope > span').textContent;
  const value = row.querySelector('b').textContent;
  row.tabIndex = 0;
  row.setAttribute('aria-label', `${label}: ${value}% average success`);
  const tooltip = document.createElement('span');
  tooltip.className = 'chart-tooltip';
  tooltip.textContent = `${label} · ${value}% success`;
  tooltip.setAttribute('aria-hidden', 'true');
  row.append(tooltip);
  const replay = () => replayResult(row.querySelector('.track > span'),
    [{transform:'scaleX(0)'},{transform:'scaleX(1)'}],
    {duration:800,easing:'cubic-bezier(.22,1,.36,1)'});
  row.addEventListener('pointerenter', replay);
  row.addEventListener('focus', replay);
  row.addEventListener('click', replay);
});
document.querySelectorAll('.reward-gallery figure').forEach(figure => {
  const imageButton = figure.querySelector('.image-button');
  const img = imageButton.querySelector('img');
  const controls = document.createElement('div');
  controls.className = 'curve-controls';
  const hint = document.createElement('span');
  hint.textContent = 'Hover to reveal · Click the plot to enlarge';
  const replayButton = document.createElement('button');
  replayButton.type = 'button';
  replayButton.className = 'curve-replay';
  replayButton.textContent = '↻ Replay';
  replayButton.setAttribute('aria-label', `Replay ${img.alt}`);
  controls.append(hint, replayButton);
  figure.append(controls);
  const replay = () => {
    if (!img.complete || !img.naturalWidth) return;
    replayResult(img,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)'}],
      {duration:1600,easing:'cubic-bezier(.25,.1,.25,1)'});
  };
  imageButton.addEventListener('pointerenter', replay);
  imageButton.addEventListener('focus', replay);
  replayButton.addEventListener('click', replay);
});
