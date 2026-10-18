// Shared navigation and progressive enhancements. No data requests or persistence.
(() => {
  const header = document.querySelector('header');
  const nav = header?.querySelector('nav');
  const menu = header?.querySelector('[data-m0ve-menu]');
  if (nav && menu) {
    const close = () => { nav.removeAttribute('data-m0ve-open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open navigation'); };
    menu.addEventListener('click', () => {
      const open = !nav.hasAttribute('data-m0ve-open');
      nav.toggleAttribute('data-m0ve-open', open);
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.hasAttribute('data-m0ve-open')) { close(); menu.focus(); } });
    matchMedia('(min-width:901px)').addEventListener('change', e => { if (e.matches) close(); });
  }
  // Existing atlas menus retain their own open/close handlers; add Escape and link dismissal.
  const existingMenu = header?.querySelector('.menu-toggle,.menu');
  if (nav && existingMenu) {
    const close = () => { nav.classList.remove('open'); existingMenu.setAttribute('aria-expanded','false'); existingMenu.setAttribute('aria-label','Open navigation'); };
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if(e.key==='Escape' && nav.classList.contains('open')) { close(); existingMenu.focus(); } });
  }
  const blueprint = document.querySelector('.property-blueprint');
  if (blueprint) {
    const captions = {
      space: 'Floor area and room layout help explain how a home compares with similar properties.',
      energy: 'Insulation, glazing and energy performance add useful context beyond the address.',
      condition: 'Condition, maintenance and improvements help build a fuller picture of the home.'
    };
    blueprint.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => {
      blueprint.dataset.detail = button.dataset.detail;
      blueprint.querySelectorAll('[data-detail]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      blueprint.querySelector('.blueprint-caption').textContent = captions[button.dataset.detail];
    }));
  }
})();
