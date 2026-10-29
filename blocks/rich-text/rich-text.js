/**
 * Rich Text: authored rich text rendered like default content.
 * The cell is kept (not its row) so the Universal Editor rich text instrumentation stays in place.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cells = [...block.children].map((row) => row.firstElementChild).filter(Boolean);
  cells.forEach((cell) => cell.classList.add('rich-text-content'));
  block.replaceChildren(...cells);
}
