import { decorateIcons } from '../../scripts/aem.js';
import { readLines } from '../whatsapp/whatsapp.js';

function createElement(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

/**
 * Builds the side drawer with the chat iframe. The iframe is only loaded when the drawer opens.
 * @param {string} url The page to load in the iframe
 * @param {string} title The iframe and drawer title
 */
function buildDrawer(url, title) {
  const drawer = createElement('dialog', 'chat-button-drawer');
  drawer.setAttribute('aria-label', title);
  const content = createElement('div', 'chat-button-drawer-content');

  // slide the drawer out before closing it (skipped when animations are disabled)
  const closeDrawer = () => {
    if (!drawer.open || drawer.classList.contains('is-closing')) return;
    if (getComputedStyle(drawer).animationName === 'none') {
      drawer.close();
      return;
    }
    drawer.classList.add('is-closing');
    drawer.addEventListener('animationend', () => {
      drawer.classList.remove('is-closing');
      drawer.close();
    }, { once: true });
  };

  const close = createElement('button', 'chat-button-drawer-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Fechar');
  const closeIcon = createElement('span', 'icon icon-close');
  close.append(closeIcon);
  close.addEventListener('click', closeDrawer);

  const iframe = createElement('iframe', 'chat-button-frame');
  iframe.title = title;

  content.append(close, iframe);
  drawer.append(content);

  // close on backdrop click and on Escape, keep the page from scrolling while open
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });
  drawer.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDrawer();
  });
  drawer.addEventListener('close', () => {
    document.body.style.overflow = '';
  });

  const openDrawer = () => {
    if (!iframe.getAttribute('src')) iframe.src = url;
    document.body.style.overflow = 'hidden';
    drawer.showModal();
  };
  return { drawer, openDrawer };
}

/**
 * Chat Button: floating chat icon (above the WhatsApp icon) that expands a label on hover
 * and opens the chat page in a side drawer.
 * Rows: chat URL, hover text, accessible label.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const link = block.querySelector('a');
  const textRows = rows.filter((row) => !row.querySelector('a'));
  const urlText = textRows.map((row) => row.textContent.trim()).find((t) => /^https?:\/\//.test(t));
  const url = link?.href || urlText || '';
  const [hoverRow, labelRow] = textRows.filter((row) => row.textContent.trim() !== urlText);
  const hoverLines = readLines(hoverRow?.firstElementChild);
  const label = labelRow?.textContent.trim() || hoverLines.join(' ') || 'Chat';

  if (!url) {
    block.replaceChildren();
    return;
  }

  const { drawer, openDrawer } = buildDrawer(url, label);

  const trigger = createElement('button', 'chat-button-trigger');
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-label', label);

  if (hoverLines.length) {
    const text = createElement('span', 'chat-button-hover-text');
    text.setAttribute('aria-hidden', 'true');
    hoverLines.forEach((line, i) => {
      if (i) text.append(document.createElement('br'));
      text.append(line);
    });
    trigger.append(text);
  }
  trigger.append(createElement('span', 'icon icon-chat'));
  trigger.addEventListener('click', openDrawer);

  block.replaceChildren(trigger, drawer);
  decorateIcons(block);
}
