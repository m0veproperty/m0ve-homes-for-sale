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

// Restrained, interruptible motion for content changes and native disclosures.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Map();
  const ease = 'cubic-bezier(.22,1,.36,1)';
  function reveal(el) {
    if (reduced.matches || !el.getClientRects().length || !el.animate) return;
    running.get(el)?.cancel();
    const animation = el.animate([{opacity:.18,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:ease});
    running.set(el,animation);
    animation.onfinish = () => running.delete(el);
  }
  // Observe only changing content regions; leave controls and focus in place.
  const regions = document.querySelectorAll('[role="tabpanel"],.detail-note,.evidence-reading,.blueprint-caption,.place-picker,.place-card>p,#local-copy,#home-guide-copy,.area-story,.world-copy,.comparison-result,.district-feature,.home-detail,#form-content,#chart-value,#area-description');
  regions.forEach(el => {
    new MutationObserver(() => reveal(el)).observe(el,{childList:true,subtree:true,characterData:true,attributes:el.matches('[role="tabpanel"]'),attributeFilter:['hidden','aria-hidden']});
  });
  const disclosureState = new WeakMap();
  document.querySelectorAll('details').forEach(el => {
    const summary = el.querySelector(':scope > summary');
    if (!summary) return;
    summary.addEventListener('click', event => {
      if (event.target.closest('a,button,input,select,textarea') || reduced.matches || !el.animate) return;
      event.preventDefault();
      const prior = disclosureState.get(el);
      const opening = prior ? !prior.opening : !el.open;
      const start = el.getBoundingClientRect().height;
      prior?.animation.cancel();
      el.style.height = '';
      el.style.overflow = 'hidden';
      el.open = true;
      const expanded = el.getBoundingClientRect().height;
      const style = getComputedStyle(el);
      const collapsed = summary.getBoundingClientRect().height + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const animation = el.animate({height:[`${start}px`,`${opening ? expanded : collapsed}px`]}, {duration:300,easing:ease});
      disclosureState.set(el,{animation,opening});
      running.set(el,animation);
      const finish = () => {
        el.open = opening;
        el.style.height = '';
        el.style.overflow = '';
        disclosureState.delete(el);
        running.delete(el);
      };
      animation.onfinish = finish;
      // A preference change should settle to the requested state immediately.
      animation.oncancel = () => { if (reduced.matches) finish(); };
    });
  });
  reduced.addEventListener('change', e => { if(e.matches) { running.forEach(animation=>animation.cancel()); running.clear(); } });
})();
