/**
 * Announcement Banner: a slim promotional strip with an optional icon and a short rich text.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell || (!cell.textContent.trim() && !cell.querySelector('picture'))) {
      row.remove();
      return;
    }
    const isIcon = cell.querySelector('picture') && !cell.textContent.trim();
    row.className = isIcon ? 'announcement-banner-icon' : 'announcement-banner-text';
  });
}
