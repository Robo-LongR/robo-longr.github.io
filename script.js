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
