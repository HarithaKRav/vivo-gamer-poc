/**
 * CTA Bar: sticky bottom bar with a label and a call (or link) button.
 * Rows: label, phone number, optional link that overrides the phone call.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const link = block.querySelector('a');
  const [label = '', phone = ''] = rows
    .filter((row) => !row.querySelector('a'))
    .map((row) => row.textContent.trim());

  const text = document.createElement('p');
  text.className = 'cta-bar-label';
  text.textContent = label;

  const button = document.createElement('a');
  button.className = 'cta-bar-button';
  button.textContent = phone || link?.textContent.trim() || '';
  const digits = phone.replace(/[^\d+]/g, '');
  if (link) button.href = link.getAttribute('href');
  else if (digits) button.href = `tel:${digits}`;

  const content = [];
  if (label) content.push(text);
  if (button.textContent) content.push(button);
  block.replaceChildren(...content);
}
