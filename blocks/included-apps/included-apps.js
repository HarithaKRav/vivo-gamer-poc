/**
 * Included Apps: apps listed in the Pricing Cards of the same section (logo, name, description).
 * The rows are kept as they are, because the Pricing Cards block reads them. The block itself is
 * only shown in the Universal Editor, where authors add, edit and remove apps.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('included-apps-item');
    const [logoCell, textCell] = [...row.children];
    logoCell?.classList.add('included-apps-logo');
    textCell?.classList.add('included-apps-text');
  });
}
