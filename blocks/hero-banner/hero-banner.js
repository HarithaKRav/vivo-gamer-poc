import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Hero Banner: dark campaign banner with eyebrow, heading, a list of benefits and an image.
 * Rows with a single cell are the image and the heading, rows with two cells are benefits.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const content = document.createElement('div');
  content.className = 'hero-banner-content';
  const media = document.createElement('div');
  media.className = 'hero-banner-image';
  const benefits = document.createElement('ul');
  benefits.className = 'hero-banner-benefits';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length > 1) {
      const [iconCell, textCell] = cells;
      const li = document.createElement('li');
      moveInstrumentation(row, li);
      const picture = iconCell.querySelector('picture');
      if (picture) {
        picture.classList.add('hero-banner-benefit-icon');
        li.append(picture);
      }
      const text = document.createElement('div');
      text.className = 'hero-banner-benefit-text';
      text.append(...textCell.childNodes);
      li.append(text);
      benefits.append(li);
      return;
    }

    const [cell] = cells;
    if (!cell) return;
    const picture = cell.querySelector('picture');
    if (picture && !cell.textContent.trim()) {
      media.append(picture);
      return;
    }
    [...cell.children].forEach((el) => {
      if (!/^H[1-6]$/.test(el.tagName)) el.classList.add('hero-banner-eyebrow');
      content.append(el);
    });
  });

  if (benefits.children.length) content.append(benefits);
  block.replaceChildren(content);
  if (media.children.length) block.append(media);
  else block.classList.add('no-image');
}
