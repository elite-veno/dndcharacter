// Info tab: searchable, collapsible how-to-play reference with a sticky table of contents.

import { h, mount } from './ui.js';
import { SECTIONS } from './info-content.js';

/** Render the Info page into `root`. */
export function renderInfo(root) {
  const sections = SECTIONS.map((s) => {
    const details = h('details', { class: 'info-section', id: `info-${s.id}`, open: true },
      h('summary', {}, h('h2', {}, s.title)),
      h('div', { class: 'info-body' }, s.build()));
    return { ...s, el: details, items: filterUnits(details.querySelector('.info-body')) };
  });

  const search = h('input', { type: 'search', id: 'info-search', placeholder: 'Search rules, e.g. grapple, cover, exhaustion', 'aria-label': 'Search the rules guide' });
  const status = h('p', { class: 'hint', role: 'status' });
  const empty = h('p', { class: 'empty', hidden: true }, 'No rules match your search.');
  const tocLinks = new Map();

  const tocList = h('ol', { class: 'info-toc-list' }, sections.map((s) => {
    const a = h('a', { href: `#/info`, onclick: (e) => { e.preventDefault(); goTo(s); } }, s.title);
    tocLinks.set(s.id, a);
    return h('li', {}, a);
  }));
  const toc = h('nav', { class: 'info-toc', 'aria-label': 'Table of contents' },
    h('details', { class: 'info-toc-box', open: window.matchMedia('(min-width: 900px)').matches },
      h('summary', {}, 'Contents'), tocList));

  function goTo(s) {
    if (s.el.hidden) { search.value = ''; applyFilter(); }
    s.el.open = true;
    s.el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    s.el.querySelector('summary').focus({ preventScroll: true });
  }

  function applyFilter() {
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let visibleSections = 0;
    for (const s of sections) {
      let show = true;
      if (terms.length) {
        const title = s.title.toLowerCase();
        const titleHit = terms.every((t) => title.includes(t));
        if (titleHit) {
          s.items.forEach((i) => { i.hidden = false; });
        } else {
          let hits = 0;
          s.items.forEach((i) => {
            const ok = terms.every((t) => i.textContent.toLowerCase().includes(t));
            i.hidden = !ok;
            if (ok) hits += 1;
          });
          show = hits > 0;
        }
        if (show) s.el.open = true;
      } else {
        s.items.forEach((i) => { i.hidden = false; });
      }
      s.el.hidden = !show;
      tocLinks.get(s.id).parentElement.hidden = !show;
      if (show) visibleSections += 1;
    }
    empty.hidden = visibleSections > 0;
    status.textContent = terms.length ? `${visibleSections} matching section${visibleSections === 1 ? '' : 's'}.` : '';
  }
  search.addEventListener('input', applyFilter);

  const setAll = (open) => sections.forEach((s) => { if (!s.el.hidden) s.el.open = open; });

  // Highlight the section being read in the table of contents.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id.replace(/^info-/, '');
        tocLinks.forEach((a, key) => a.classList.toggle('current', key === id));
      }
    }, { rootMargin: '-15% 0px -75% 0px' });
    sections.forEach((s) => observer.observe(s.el));
  }

  mount(root, h('div', { class: 'page info-page' },
    h('header', { class: 'info-head' },
      h('h1', {}, 'How to Play'),
      p('A quick reference to the 2024 fifth edition rules: from your first d20 roll to defense, damage, conditions and spellcasting. Based on the SRD 5.2.'),
      h('div', { class: 'info-controls' },
        h('div', { class: 'field' }, h('label', { for: 'info-search' }, 'Search'), search),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn small', onclick: () => setAll(true) }, 'Expand all'),
          h('button', { type: 'button', class: 'btn small', onclick: () => setAll(false) }, 'Collapse all'))),
      status),
    h('div', { class: 'info-layout' },
      toc,
      h('div', { class: 'info-content' }, sections.map((s) => s.el), empty))));
}

function p(text) { return h('p', { class: 'lead' }, text); }

/** Every direct child of the body is a searchable block; children that wrap info-items are searched per item. */
function filterUnits(body) {
  const units = [];
  for (const child of body.children) {
    const nested = child.classList.contains('info-item') ? [] : [...child.querySelectorAll('.info-item')];
    if (nested.length) units.push(...nested); else units.push(child);
  }
  return units;
}
