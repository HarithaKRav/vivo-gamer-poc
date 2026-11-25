/**
 * Legal Disclaimer: small print with promotional terms and regulatory information.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    if (!row.textContent.trim()) row.remove();
    else row.className = 'legal-disclaimer-text';
  });
}
