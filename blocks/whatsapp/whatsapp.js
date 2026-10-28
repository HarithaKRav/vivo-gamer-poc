import { decorateIcons } from '../../scripts/aem.js';

/**
 * WhatsApp: floating icon that opens a WhatsApp chat in a new tab.
 * Rows: phone number (with country code), pre-filled message, accessible label.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [phone = '', message = '', label = ''] = [...block.children]
    .map((row) => row.textContent.trim());
  const digits = phone.replace(/\D/g, '');
  if (!digits) {
    block.replaceChildren();
    return;
  }

  const url = new URL(`https://wa.me/${digits}`);
  if (message) url.searchParams.set('text', message);

  const link = document.createElement('a');
  link.className = 'whatsapp-link';
  link.href = url.href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', label || 'WhatsApp');
  const icon = document.createElement('span');
  icon.className = 'icon icon-whatsapp';
  link.append(icon);

  block.replaceChildren(link);
  decorateIcons(block);
}
