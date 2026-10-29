import { getMetadata } from '../../scripts/aem.js';
import { flattenRichText, loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (fragment) flattenRichText(fragment);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // images that stand on their own (e.g. the 5G logo) are shown aside the footer text
  footer.querySelectorAll('.default-content-wrapper > p').forEach((p) => {
    if (p.querySelector('picture') && !p.textContent.trim()) p.classList.add('footer-logo');
  });

  block.append(footer);
}
