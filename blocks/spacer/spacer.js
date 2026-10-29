/**
 * Spacer: empty vertical space. The height comes from the block options (see spacer.css).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  block.setAttribute('aria-hidden', 'true');
}
