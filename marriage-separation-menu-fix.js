/* Ensures the marriage-separation modal is present in the public modal menu.
   The admin editor registry and the public menu registry are separate. */
(function () {
  'use strict';
  var modalId = 'marriageSeparationModal';
  function addMarriageSeparationCard() {
    var grid = document.getElementById('modalsHomeGrid');
    if (!grid || !document.getElementById(modalId)) return;
    if (grid.querySelector('[data-modal-id="' + modalId + '"]')) return;
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'utility-tool-card';
    card.setAttribute('data-modal-id', modalId);
    card.innerHTML =
      '<span class="ut-icon">💔</span>' +
      '<span class="ut-title">ازدواج با جدایی</span>' +
      '<span class="ut-desc">محاسبه سنتی سرانجام ازدواج</span>';
    card.addEventListener('click', function () {
      if (typeof window.openModalGlass === 'function') {
        window.openModalGlass(modalId);
      }
    });
    grid.appendChild(card);
  }
  function start() {
    addMarriageSeparationCard();
    var grid = document.getElementById('modalsHomeGrid');
    if (grid && typeof MutationObserver !== 'undefined') {
      new MutationObserver(addMarriageSeparationCard).observe(grid, { childList: true });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
