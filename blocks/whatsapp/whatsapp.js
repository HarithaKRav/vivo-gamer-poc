import { decorateIcons } from '../../scripts/aem.js';

/**
 * Reads the lines of a text cell, keeping authored line breaks (new lines, <br> or paragraphs).
 * @param {Element} cell The cell
 * @returns {string[]} The non-empty lines
 */
export function readLines(cell) {
  if (!cell) return [];
  const lines = [];
  let current = '';
  const walk = (node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const [first, ...rest] = child.textContent.split('\n');
        current += first;
        rest.forEach((part) => {
          lines.push(current);
          current = part;
        });
      } else if (child.nodeName === 'BR') {
        lines.push(current);
        current = '';
      } else {
        const isBlock = /^(P|DIV|LI|H[1-6])$/.test(child.nodeName);
        if (isBlock && current.trim()) {
          lines.push(current);
          current = '';
        }
        walk(child);
        if (isBlock) {
          lines.push(current);
          current = '';
        }
      }
    });
  };
  walk(cell);
  lines.push(current);
  return lines.map((line) => line.trim()).filter(Boolean);
}

/**
 * WhatsApp: floating icon that opens a WhatsApp chat in a new tab.
 * On hover a label expands next to the icon.
 * Rows: phone number (with country code), pre-filled message, accessible label, hover text.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [phone = '', message = '', label = ''] = rows.slice(0, 3)
    .map((row) => row.textContent.trim());
  const hoverLines = readLines(rows[3]?.firstElementChild);
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
  link.title = label || 'WhatsApp';
  const hoverSentence = hoverLines.join(' ');
  link.setAttribute('aria-label', [label || 'WhatsApp', hoverSentence].filter(Boolean).join(' - '));

  if (hoverLines.length) {
    const text = document.createElement('span');
    text.className = 'whatsapp-hover-text';
    text.setAttribute('aria-hidden', 'true');
    hoverLines.forEach((line, i) => {
      if (i) text.append(document.createElement('br'));
      text.append(line);
    });
    link.append(text);
  }

  const icon = document.createElement('span');
  icon.className = 'icon icon-whatsapp';
  link.append(icon);

  block.replaceChildren(link);
  decorateIcons(block);
}
