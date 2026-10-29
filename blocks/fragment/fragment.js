/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

// eslint-disable-next-line import/no-cycle
import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

const INSTRUMENTATION = '[data-aue-resource],[data-richtext-resource]';

/**
 * Removes Universal Editor instrumentation from fragment content that is also part of the
 * current page, e.g. the nav page rendered again in its own header. The editor would otherwise
 * attach those components to the copy outside of main and hide them from the content tree.
 * @param {Element} fragment The fragment root element
 */
function removeDuplicateInstrumentation(fragment) {
  const pageMain = document.querySelector('main');
  if (!pageMain) return;
  const resourceOf = (el) => el.dataset.aueResource || el.dataset.richtextResource;
  const pageResources = new Set([pageMain, ...pageMain.querySelectorAll(INSTRUMENTATION)]
    .map(resourceOf)
    .filter(Boolean));
  if (!pageResources.size) return;

  fragment.querySelectorAll(INSTRUMENTATION).forEach((el) => {
    if (!pageResources.has(resourceOf(el))) return;
    [...el.attributes]
      .map(({ name }) => name)
      .filter((name) => name.startsWith('data-aue-') || name.startsWith('data-richtext-'))
      .forEach((name) => el.removeAttribute(name));
  });
}

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/') && !path.startsWith('//')) {
    // eslint-disable-next-line no-param-reassign
    path = path.replace(/(\.plain)?\.html/, '');
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      removeDuplicateInstrumentation(main);

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) block.replaceChildren(...fragment.childNodes);
}
