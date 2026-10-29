# Fix: Text Component Has No Fields in the Universal Editor, and Header/Footer Authoring Guide

## Problem

When you select a **Text** component, the properties panel on the right is empty. This happens on every page.

## Cause

It's the model. In this project, the Text component has no fields defined:
- `models/_text.json` has an **empty list of fields** (`"models": []`).
- The Text component's starting values don't point to a model either (`"template": {}`).

The Universal Editor builds the properties panel from a component's model. With no model, there's nothing to show.

This is in the project's original setup file, not in my changes. I never edited `models/_text.json`. My only change to the default components was adding the new blocks to the list of what a section can hold. The other default components are set up correctly: Title has fields (Title and Title Type), Image has Image and Alt Text, and Button has its own fields.

**Workaround for now:** a Text component is usually edited directly on the page. **Double-click the text** on the canvas to type, format, add lists and add links. The fix below adds the panel field as well.

## Fix (requires Execute mode)

1. **`models/_text.json`:** add a `text` model with one rich text field, and point the Text component at it:
   ```json
   {
     "definitions": [
       {
         "title": "Text",
         "id": "text",
         "plugins": {
           "xwalk": {
             "page": {
               "resourceType": "core/franklin/components/text/v1/text",
               "template": {
                 "name": "Text",
                 "model": "text"
               }
             }
           }
         }
       }
     ],
     "models": [
       {
         "id": "text",
         "fields": [
           {
             "component": "richtext",
             "name": "text",
             "value": "",
             "label": "Text",
             "valueType": "string"
           }
         ]
       }
     ]
   }
   ```
   Field name `text` is the property the Text component already stores its content in, so existing text is kept.
2. **Rebuild** the combined files (`npm run build:json`) and check that `component-models.json` now has the `text` model.
3. **Lint** (`npm run lint`).
4. **Second fix, for the nav and footer pages only:** in `scripts/editor-support.js`, look up changed components only inside the page content (`main`), including `main` itself.
   - On the nav and footer pages, the same content is on screen twice: once as the page and once inside the header or footer.
   - Today the script can update the header copy instead of the page, so a new component doesn't appear until you reload. That's what you saw earlier on the nav page.
5. **Local test:**
   - Check that the rebuilt Universal Editor files list the `text` model.
   - With an imitation of an editor change on a page where content appears twice, check that only the page content updates.
   - Check that block edits (e.g. Link List) still work.
6. **Commit** on `poc`. **Push** after you confirm, then check that the branch's preview site serves the new `component-models.json`.
7. **Retest in the Universal Editor:**
   - Reload the editor, add a new Text and select it. The panel should show a **Text** field.
   - Select an existing Text. If its panel is still empty, it was created before the model existed. Copy its content, delete it, add a new Text and paste the content back. Double-click editing keeps working either way.

## Header and footer authoring

The header and footer are separate AEM pages authored with standard components. The code loads **nav** as the header and **footer** as the footer on every page.

| Part | AEM page | What the code expects |
|---|---|---|
| Header | `/content/vivo-gamer-poc/nav` | **Section 1:** the logos. **Section 2:** the menu links, as a bulleted list. |
| Footer | `/content/vivo-gamer-poc/footer` | One section with copyright text, a privacy link and the 5G logo. |

### Header (nav page)
1. Open `/content/vivo-gamer-poc/nav` in the Universal Editor, or create it with the Edge Delivery page template and name it `nav`.
2. **Section 1:** two **Image** components:
   - Vivo logo (`logo-vivo.svg`), **Alt text** `Logo Vivo`
   - Vivo Fibra logo (`logo-vivo-fibra.svg`), **Alt text** `Vivo Fibra`
   - Keep only these two images in this section.
3. **Section 2:** a **Text** component with a **bulleted list**:
   - `Ofertas` → link `#ofertas`
   - `Vivo Fibra Gamer` → link `#fibra-gamer`
   - Edit it by double-clicking the text, or in the panel once the fix is in. Don't make the links bold or italic.
4. No third section. **Publish** the nav page.

**Make the menu links work.** On the Fibra Gamer page, set each section's **Anchor ID**:
- the Pricing Cards section → `ofertas`
- the Hero Banner section → `fibra-gamer`

### Footer (footer page)
1. Open `/content/vivo-gamer-poc/footer`, or create it and name it `footer`.
2. **One section**, in this order:
   - **Text:** `Copyright © 2026 Vivo. Todos os direitos reservados.`
   - **Text:** only the link `Política de Privacidade` → `https://www.vivo.com.br/a-vivo/informacoes-aos-clientes/centro-de-privacidade`. Not bold or italic, and not the Button component.
   - **Image:** `logo-vivo-5g.svg`, **Alt text** `Logo Vivo 5G`. It's placed on the right automatically.
3. **Publish** the footer page.

**Assets:** upload `logo-vivo.svg`, `logo-vivo-fibra.svg` and `logo-vivo-5g.svg` to `/content/dam/vivo-gamer-poc` if they aren't there yet.

**Good to know:**
- Every page uses `/nav` and `/footer`.
- The published site updates only after you publish those pages.
- The AEM site has to use the `poc` code (or `poc` merged into its branch).

## Checklist

**Text component fix (Execute mode)**
- [ ] `models/_text.json`: add the `text` model (one rich text field named `text`) and set the template to `{"name": "Text", "model": "text"}`
- [ ] Run `npm run build:json` and confirm `component-models.json` has the `text` model
- [ ] `scripts/editor-support.js`: look up changed components only inside `main`, so the nav and footer pages update correctly
- [ ] Local test: Universal Editor files list the `text` model; an imitated edit on a page with duplicated content updates only the page content; block edits still work
- [ ] `npm run lint` passes
- [ ] Commit on `poc`
- [ ] Push to `poc` (after you confirm) and check that the preview serves the new `component-models.json`
- [ ] Universal Editor: a new Text shows a **Text** field in the panel
- [ ] Universal Editor: existing Text components with an empty panel are re-added if needed

**Header and footer authoring**
- [ ] Logo SVGs uploaded to `/content/dam/vivo-gamer-poc`
- [ ] nav Section 1: two Image components with alt text
- [ ] nav Section 2: Text with a bulleted list linking to `#ofertas` and `#fibra-gamer`
- [ ] nav page published
- [ ] footer page: copyright Text, privacy link Text, 5G logo Image
- [ ] footer page published
- [ ] Fibra Gamer page: Anchor IDs `ofertas` and `fibra-gamer` set
- [ ] Checked on desktop and on mobile (hamburger menu, anchor scrolling)

The code changes need Execute mode. Switch to it and I'll make the fix.
