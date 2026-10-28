import { decorateIcons } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// number of app logos shown in the card before the "+N" counter
const VISIBLE_APPS = 3;

const DEFAULT_LABELS = {
  details: 'Mais detalhes',
  appsHeading: 'Serviços digitais inclusos:',
  appsLink: 'Conferir apps',
  appsDialog: 'Apps inclusos nos planos',
  cta: 'Consultar',
};

let instanceCount = 0;

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function createIcon(name) {
  return createElement('span', `icon icon-${name}`);
}

/**
 * Splits a composite multi-field cell into its items.
 * Items with several elements are separated by <hr>, items with a single element are list items.
 * @param {Element} cell The cell element
 * @returns {Element[][]} The elements of each item
 */
function splitItems(cell) {
  if (!cell) return [];
  const list = cell.querySelector(':scope > ul');
  if (list && cell.children.length === 1) return [...list.children].map((li) => [...li.children]);

  const items = [];
  let current = [];
  [...cell.children].forEach((el) => {
    if (el.tagName === 'HR') {
      if (current.length) items.push(current);
      current = [];
    } else {
      current.push(el);
    }
  });
  if (current.length) items.push(current);
  return items;
}

function getLink(el) {
  return el.tagName === 'A' ? el : el.querySelector('a');
}

function getTexts(elements) {
  return elements
    .filter((el) => !getLink(el) && !el.querySelector('picture'))
    .map((el) => el.textContent.trim())
    .filter(Boolean);
}

function parseOption(elements) {
  const link = elements.map(getLink).find(Boolean);
  const [planName = '', label = '', price = '', details = ''] = getTexts(elements);
  return {
    planName,
    label,
    price,
    details,
    href: link?.getAttribute('href') || '',
    ctaText: link?.textContent.trim() || '',
  };
}

function parseApp(elements) {
  const picture = elements
    .map((el) => (el.tagName === 'PICTURE' ? el : el.querySelector('picture')))
    .find(Boolean);
  const [name = '', description = ''] = getTexts(elements);
  return { picture, name, description };
}

function readLabels(row) {
  const texts = row ? getTexts([...row.firstElementChild.children]) : [];
  const [
    details = DEFAULT_LABELS.details,
    appsHeading = DEFAULT_LABELS.appsHeading,
    appsLink = DEFAULT_LABELS.appsLink,
    appsDialog = DEFAULT_LABELS.appsDialog,
  ] = texts;
  return {
    details, appsHeading, appsLink, appsDialog,
  };
}

function buildHeading(row) {
  const heading = createElement('div', 'pricing-cards-heading');
  moveInstrumentation(row, heading);
  const cell = row.firstElementChild;
  [...cell.children].forEach((el) => {
    if (!/^H[1-6]$/.test(el.tagName)) el.classList.add('pricing-cards-eyebrow');
    heading.append(el);
  });
  return heading;
}

function buildDrawer(id, title, apps) {
  const drawer = createElement('dialog', 'pricing-cards-drawer');
  drawer.setAttribute('aria-labelledby', `${id}-title`);
  const content = createElement('div', 'pricing-cards-drawer-content');

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

  const close = createElement('button', 'pricing-cards-drawer-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Fechar');
  close.append(createIcon('close'));
  close.addEventListener('click', closeDrawer);

  const heading = createElement('h2', 'pricing-cards-drawer-title', title);
  heading.id = `${id}-title`;

  const list = createElement('ul', 'pricing-cards-drawer-apps');
  apps.forEach(({ picture, name, description }) => {
    const li = createElement('li');
    if (picture) li.append(picture);
    const text = createElement('div', 'pricing-cards-drawer-app-text');
    if (name) text.append(createElement('p', 'pricing-cards-drawer-app-name', name));
    if (description) text.append(createElement('p', 'pricing-cards-drawer-app-description', description));
    li.append(text);
    list.append(li);
  });

  content.append(close, heading, list);
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
    document.body.style.overflow = 'hidden';
    drawer.showModal();
  };
  return { drawer, openDrawer };
}

function buildDetails(id, labels, apps, openDrawer) {
  const details = createElement('div', 'pricing-card-details');
  details.id = `${id}-details`;
  details.hidden = true;

  details.append(createElement('p', 'pricing-card-apps-heading', labels.appsHeading));

  const preview = createElement('div', 'pricing-card-apps-preview');
  apps.slice(0, VISIBLE_APPS).forEach(({ picture }) => {
    if (picture) preview.append(picture.cloneNode(true));
  });
  if (apps.length > VISIBLE_APPS) {
    const more = createElement('span', 'pricing-card-apps-more', `+${apps.length - VISIBLE_APPS}`);
    more.setAttribute('aria-label', `mais ${apps.length - VISIBLE_APPS} apps`);
    preview.append(more);
  }
  details.append(preview);

  const open = createElement('button', 'pricing-card-apps-link', labels.appsLink);
  open.type = 'button';
  open.setAttribute('aria-haspopup', 'dialog');
  open.addEventListener('click', openDrawer);
  details.append(open);

  return details;
}

function buildCard(row, labels, id) {
  const [planCell, optionsCell, appsCell] = [...row.children];
  const [speed = '', speedDescription = ''] = planCell ? getTexts([...planCell.children]) : [];
  const options = splitItems(optionsCell).map(parseOption).filter((o) => o.label || o.price);
  const apps = splitItems(appsCell).map(parseApp).filter((a) => a.picture || a.name);

  const card = createElement('li', 'pricing-card');
  moveInstrumentation(row, card);

  const body = createElement('div', 'pricing-card-body');
  const plan = createElement('p', 'pricing-card-plan');
  body.append(plan);

  const speedWrapper = createElement('div', 'pricing-card-speed');
  const speedText = createElement('div');
  speedText.append(createElement('p', 'pricing-card-speed-value', speed));
  if (speedDescription) speedText.append(createElement('p', 'pricing-card-speed-description', speedDescription));
  speedWrapper.append(createIcon('wifi'), speedText);
  body.append(speedWrapper);

  const price = createElement('p', 'pricing-card-price');
  price.setAttribute('aria-live', 'polite');
  const cta = createElement('a', 'button pricing-card-cta');

  const selectOption = (option) => {
    plan.textContent = option.planName;
    price.textContent = option.price;
    cta.textContent = option.ctaText || DEFAULT_LABELS.cta;
    if (option.href) cta.href = option.href;
    else cta.removeAttribute('href');
  };

  if (options.length > 1) {
    const fieldset = createElement('fieldset', 'pricing-card-options');
    fieldset.append(createElement('legend', 'sr-only', speed));
    options.forEach((option, i) => {
      const label = createElement('label', 'pricing-card-option');
      const input = createElement('input');
      input.type = 'radio';
      input.name = `${id}-option`;
      input.value = i;
      input.checked = i === 0;
      input.addEventListener('change', () => selectOption(option));
      const text = createElement('span', 'pricing-card-option-text');
      text.append(createElement('span', 'pricing-card-option-label', option.label));
      if (option.details) text.append(createElement('span', 'pricing-card-option-details', option.details));
      label.append(input, text);
      fieldset.append(label);
    });
    body.append(fieldset);
  } else if (options[0]?.label) {
    body.append(createElement('p', 'pricing-card-option-label', options[0].label));
  }

  const ctaWrapper = createElement('p', 'pricing-card-cta-wrapper');
  ctaWrapper.append(cta);
  body.append(price, ctaWrapper);
  if (options.length) selectOption(options[0]);
  card.append(body);

  if (apps.length) {
    const { drawer, openDrawer } = buildDrawer(id, labels.appsDialog, apps);
    const details = buildDetails(id, labels, apps, openDrawer);

    const toggle = createElement('button', 'pricing-card-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', details.id);
    toggle.append(createElement('span', '', labels.details), createIcon('chevron-down'));
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      details.hidden = expanded;
    });

    body.append(toggle);
    card.append(details, drawer);
  }

  return card;
}

/**
 * Pricing Cards: optional heading, shared labels, and a list of plan cards.
 * Block rows with a single cell hold the heading and the labels,
 * rows with several cells are cards (plan, options, apps).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  instanceCount += 1;
  const rows = [...block.children];
  const singleCellRows = rows.filter((row) => row.children.length === 1);
  const cardRows = rows.filter((row) => row.children.length > 1);

  let headingRow;
  let labelsRow;
  if (singleCellRows.length >= 2) {
    [headingRow, labelsRow] = singleCellRows;
  } else if (singleCellRows.length === 1) {
    const [row] = singleCellRows;
    if (row.querySelector('h1, h2, h3, h4, h5, h6')) headingRow = row;
    else labelsRow = row;
  }

  const labels = readLabels(labelsRow);
  const content = [];
  if (headingRow && headingRow.textContent.trim()) content.push(buildHeading(headingRow));

  const list = createElement('ul', 'pricing-cards-list');
  cardRows.forEach((row, i) => {
    list.append(buildCard(row, labels, `pricing-cards-${instanceCount}-${i + 1}`));
  });
  content.push(list);

  block.replaceChildren(...content);
  decorateIcons(block);
}
