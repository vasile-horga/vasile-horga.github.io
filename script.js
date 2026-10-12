(() => {
  const data = window.SCHOLAR_DATA || {papers: [], books: [], patents: [], awards: []};
  const $ = (id) => document.getElementById(id);
  const search = $('publication-search');
  const yearFilter = $('year-filter');
  const list = $('publication-list');
  const count = $('publication-count');
  const more = $('show-more');
  const PAGE_SIZE = 20;
  let showAll = false;
  const getYear = (item) => item.year || (item.text.match(/\b(19|20)\d{2}\b/g) || []).slice(-1)[0] || '—';
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function linkify(s) {
    const safe = escapeHtml(s);
    return safe.replace(/(https?:\/\/[^\s,;]+)/g, (url) => {
      const clean = url.replace(/[.)]+$/, '');
      const tail = url.slice(clean.length);
      return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${tail}`;
    }).replace(/(10\.\d{4,9}\/[A-Za-z0-9._;()/:+-]+)/g, (doi) => `<a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">${doi}</a>`);
  }
  function itemMarkup(item, type) {
    const year = getYear(item);
    let text = item.text;
    text = text.replace(/^\d+[a-z]?\.\s*/i, '');
    return `<article class="publication-item"><div class="pub-year">${escapeHtml(year)}</div><div><div class="pub-title">${linkify(text)}</div><div class="pub-meta">${type}</div></div></article>`;
  }
  function renderPapers() {
    const q = search.value.trim().toLocaleLowerCase();
    const year = yearFilter.value;
    const filtered = data.papers.filter(item => {
      const y = String(getYear(item));
      return (year === 'all' || y === year) && (!q || item.text.toLocaleLowerCase().includes(q) || y.includes(q));
    });
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}`;
    const shown = showAll ? filtered : filtered.slice(0, PAGE_SIZE);
    list.innerHTML = shown.length ? shown.map(item => itemMarkup(item, 'Scientific publication')).join('') : '<p class="empty-state">No publications match your search.</p>';
    more.hidden = filtered.length <= PAGE_SIZE;
    more.textContent = showAll ? 'Show fewer' : `Show ${filtered.length - PAGE_SIZE} more`;
  }
  const years = [...new Set(data.papers.map(getYear).filter(y => /^\d{4}$/.test(String(y))))].sort((a,b) => Number(b)-Number(a));
  years.forEach(y => { const option = document.createElement('option'); option.value = y; option.textContent = y; yearFilter.appendChild(option); });
  function renderCompact(id, items, type) {
    const el = $(id);
    if (!items.length) { el.innerHTML = '<p class="empty-state">No entries available.</p>'; return; }
    el.innerHTML = items.map(item => {
      const year = getYear(item);
      let text = item.text.replace(/^\d+[a-z]?\.?\s*/i, '');
      return `<article class="compact-item"><div class="pub-year">${escapeHtml(year)}</div><div><div class="pub-title">${linkify(text)}</div>${type ? `<div class="pub-meta">${type}</div>` : ''}</div></article>`;
    }).join('');
  }
  search.addEventListener('input', () => { showAll = false; renderPapers(); });
  yearFilter.addEventListener('change', () => { showAll = false; renderPapers(); });
  more.addEventListener('click', () => { showAll = !showAll; renderPapers(); });
  const toggle = document.querySelector('.menu-toggle');
  const nav = $('site-nav');
  toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }));
  renderPapers();
  renderCompact('books-list', data.books, 'Book or book chapter');
  renderCompact('patents-list', data.patents, 'Patent');
  renderCompact('awards-list', data.awards, 'Award');
})();
