/* Uy Nguyen blog — sidebar show/hide toggle (remembered) + auto-collapse on posts.
   The initial collapsed state is set by an inline <head> script to avoid FOUC;
   this file injects the controls and wires persistence.
   - Primary toggle: icon-only button pinned to the top-right of the first
     left-sidebar widget (visible while the sidebar is shown).
   - Reopen button: small floating icon shown only while the sidebar is hidden. */
(function () {
  var root = document.documentElement;
  var KEY = 'uy-sidebar';

  var PANEL_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="4" width="18" height="16" rx="2"></rect><line x1="9" y1="4" x2="9" y2="20"></line></svg>';

  function isCollapsed() { return root.classList.contains('sidebar-collapsed'); }

  function sync() {
    var hidden = isCollapsed();
    document.querySelectorAll('.uy-sidebar-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      b.classList.toggle('is-collapsed', hidden);
      var label = hidden ? 'Show sidebar' : 'Hide sidebar';
      b.setAttribute('aria-label', label);
      b.title = label;
    });
  }

  function toggle() {
    var hide = !isCollapsed();
    root.classList.toggle('sidebar-collapsed', hide);
    try { localStorage.setItem(KEY, hide ? 'hide' : 'show'); } catch (e) {}
    sync();
  }

  function makeBtn(extraClass) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'uy-sidebar-btn ' + extraClass;
    b.innerHTML = PANEL_ICON;
    b.addEventListener('click', toggle);
    return b;
  }

  function init() {
    var leftCol = document.querySelector('.column-left');
    if (!leftCol) return; // only relevant when a left sidebar exists

    // Primary toggle — top-right of the first widget card
    var host = leftCol.querySelector('.card') || leftCol;
    host.classList.add('uy-toggle-host');
    host.appendChild(makeBtn('uy-sidebar-toggle'));

    // Floating reopen button (CSS shows it only when collapsed)
    document.body.appendChild(makeBtn('uy-sidebar-reopen'));

    sync();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
