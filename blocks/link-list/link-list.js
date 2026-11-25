import { decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Checks if a link should open in a new tab (documents and other sites).
 * @param {HTMLAnchorElement} link The link
 * @returns {boolean}
 */
function opensInNewTab(link) {
  try {
    const url = new URL(link.href, window.location.href);
    return url.origin !== window.location.origin || /\.pdf$/i.test(url.pathname);
  } catch {
    return false;
  }
}

/**
 * Link List: a vertical list of full-width links with a chevron.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  [...block.children].forEach((row) => {
    const link = row.querySelector('a');
    // in the Universal Editor, keep items without a link selectable so authors can complete them
    if (!link && !row.hasAttribute('data-aue-resource')) return;

    const li = document.createElement('li');
    moveInstrumentation(row, li);

    if (!link) {
      li.className = 'link-list-placeholder';
      li.textContent = row.textContent.trim() || 'New link: set the link and text in the properties panel';
      list.append(li);
      return;
    }

    link.className = 'link-list-link';
    if (opensInNewTab(link)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    const label = document.createElement('span');
    label.className = 'link-list-label';
    label.textContent = link.textContent.trim();
    const icon = document.createElement('span');
    icon.className = 'icon icon-chevron-right';
    link.replaceChildren(label, icon);

    li.append(link);
    list.append(li);
  });
  block.replaceChildren(list);
  decorateIcons(block);
}
