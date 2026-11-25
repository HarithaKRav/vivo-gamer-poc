/**
 * Partner Promo Banner: partner logo, description and a call-to-action link.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell || (!cell.textContent.trim() && !cell.querySelector('picture'))) {
      row.remove();
      return;
    }
    const link = cell.querySelector('a');
    if (cell.querySelector('picture') && !cell.textContent.trim()) {
      row.className = 'partner-promo-logo';
    } else if (link && cell.textContent.trim() === link.textContent.trim()) {
      row.className = 'partner-promo-cta';
      link.className = 'partner-promo-link';
      link.closest('.button-wrapper')?.classList.remove('button-wrapper');
    } else {
      row.className = 'partner-promo-text';
    }
  });
}
