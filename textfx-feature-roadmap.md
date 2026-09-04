# TextFX — Feature & UI/UX Roadmap

A working list of improvements over the base TypingSVG fork. Organized so you can lift whole sections into an antigravity prompt.

---

## 1. Font System (the big one you flagged)

- **Font search/autocomplete input**: replace the free-text font field with a combobox — type to filter, arrow keys to navigate, Enter/click to select. Use the [Google Fonts API](https://developers.google.com/fonts/docs/developer_api) (`fonts.googleapis.com/css2`) to pull the full catalog client-side, cache it in localStorage/IndexedDB so it's not refetched every load.
- **Live font preview in the dropdown**: each suggestion renders the word "TextFX" (or the user's current text) in that font, not just the font name as plain text.
- **Category filters**: tabs/chips above the search — Sans Serif, Serif, Monospace, Handwriting, Display — since typing SVGs often want monospace or handwriting fonts specifically.
- **Recently used / favorited fonts**: pin a short list at the top so repeat users don't re-search.
- **Fallback warning**: if a font fails to render in the generated SVG (some fonts don't embed well in SVG `<text>` without `@font-face` base64 embedding), show an inline warning instead of silently breaking.
- **Custom font upload**: allow `.ttf`/`.woff2` upload, base64-embed it into the SVG's `<style>` block.

## 2. Core Typing Effect Features

- **Multiple animation styles beyond typewriter**: fade-in per character, slide-up per word, glitch/scramble-in, wave/bounce per letter.
- **Cursor customization**: shape (`|`, `_`, block `▌`), blink speed, color, and option to hide it after typing finishes.
- **Per-line styling** (if not already there): different font/color/size/weight per line, not just per whole animation.
- **Pause & vanish sequencing**: configurable pause duration between lines, and a "backspace/vanish before next line" toggle vs. "stack lines" toggle.
- **Repeat/loop control**: infinite loop, loop N times, or type-once-and-stop, with a repeat delay.
- **Text alignment**: left/center/right, plus vertical alignment when the SVG canvas is taller than the text block.
- **Gradient text fill**: linear/radial gradient on the text color, not just solid colors.
- **Background options**: transparent (default), solid color, gradient, or a subtle pattern — with a rounded-corner + border option for the whole SVG frame.
- **Emoji support**: verify emoji render correctly in the SVG text (common failure point in these generators).

## 3. UI/UX Overhaul

- **Split-pane live layout**: form on one side, sticky/pinned live SVG preview on the other (currently probably re-renders below the fold) — preview should update in real time as fields change, no "generate" button needed until export.
- **Replace raw HTML inputs with a proper component set**: styled sliders for numeric values (font size, speed, pause duration) instead of number inputs, a real color picker (swatches + hex input + eyedropper) instead of a plain `<input type=color>`, toggle switches instead of checkboxes.
- **Grouped, collapsible sections**: "Text", "Font & Color", "Animation & Timing", "Canvas & Background", "Export" — collapsed by default except Text, so the form doesn't feel like a giant wall.
- **Presets/themes**: a row of one-click starter presets (e.g. "Terminal Green," "Neon Cyberpunk," "Minimal Mono," "Pastel Handwritten") that populate the whole form at once — great for people who don't want to tweak 15 fields.
- **URL state / shareable config**: encode the current settings into the URL query string so a config can be shared/bookmarked without needing an account.
- **Undo/reset**: a reset-to-default button, and ideally undo for the last change.
- **Copy buttons with feedback**: Markdown/HTML snippet copy should show a toast/checkmark, not just silently copy.
- **Responsive/mobile pass**: form + preview stack cleanly on small screens; right now if the form "sucks" on desktop it's likely worse on mobile.
- **Dark/light theme toggle** for the *app itself* (independent of the SVG's own background), respecting `prefers-color-scheme`.
- **Empty/error states**: helpful placeholder text, validation messages (e.g. font not found, text too long for canvas) instead of silent failure or a broken SVG.

## 4. GitHub-Themed Design System

Since it's mostly used *for* GitHub READMEs, leaning into GitHub's own look makes the tool feel native rather than like a random third-party site.

- **Use GitHub Primer as the design language**: pull the actual [Primer color primitives](https://primer.style/foundations/color) (`--fgColor-default`, `--borderColor-default`, `--bgColor-muted`, etc.) rather than eyeballing GitHub's colors. Primer ships as CSS variables/npm package (`@primer/primitives`) so you get exact parity, including both `light` and `dark` (and `dark_dimmed`) themes for free.
- **Match GitHub's exact type system**: font stack `-apple-system, BlinkMacSystemFont, "Segoe UI", Noto Sans, Helvetica, Arial, sans-serif`, GitHub's monospace stack (`ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas`) for code/snippet blocks, and their type scale (12/14/16px body sizes).
- **Component parity, not just colors**:
  - Buttons styled exactly like GitHub's (`.btn`, `.btn-primary` green, subtle border + shadow on default buttons, same hover/active states).
  - Inputs with GitHub's focus ring (blue outline + subtle box-shadow), same border radius (6px), same border color tokens.
  - Panels/cards using GitHub's bordered-box style (`border-color-default`, `bg-color-inset` for the "canvas" areas).
  - Tabs styled like GitHub's underline tabs for switching between form sections.
- **Octicons**: use GitHub's own icon set ([`@primer/octicons-react`](https://primer.style/octicons)) instead of a generic icon library — visually it'll read as "GitHub-native" instantly.
- **README preview mode**: the killer feature for this theme — render the generated SVG *inside a mock GitHub README/file viewer frame* (file header bar, "Raw" button, markdown body styling) so the user sees exactly how it'll look once embedded, not just a bare SVG on a plain background.
- **Light/dark parity with GitHub's actual toggle**: default to system `prefers-color-scheme`, but also let users manually preview both — since the SVG might render differently against GitHub's light vs. dark README background, this is genuinely functional, not just cosmetic.
- **GitHub-style command palette** (`Cmd/Ctrl+K`): quick-jump to sections, apply a preset, copy the snippet, toggle theme — mirrors GitHub's own `Cmd+K` palette and fits the audience (mostly devs) well.

## 5. Motion & Micro-interactions

Subtle, not flashy — GitHub's own UI barely animates, so lean toward "snappy and considered" rather than bouncy.

- **Input focus/blur transitions**: border-color and box-shadow animate in ~100–150ms instead of snapping.
- **Panel expand/collapse**: accordion sections for the grouped form (Text / Font / Animation / Canvas / Export) slide open with height + opacity transition, not an instant show/hide.
- **Live preview crossfade**: when a setting changes, crossfade the SVG update instead of a hard flash/reflow — makes rapid tweaking feel smooth instead of janky.
- **Button press feedback**: slight scale-down (~0.97) on `:active`, matching GitHub's own tactile button feel.
- **Copy-to-clipboard**: icon morphs (copy → checkmark) with a quick spring, plus a small toast — no jarring `alert()`.
- **Skeleton loading state** for the font list while it fetches/hydrates from cache, instead of a blank dropdown.
- **Slider thumb drag**: value bubble follows the thumb while dragging (common pattern, e.g. range inputs in design tools).
- **Reduced-motion respect**: honor `prefers-reduced-motion` and drop non-essential transitions for users who've opted out.
- **Library choice**: for React, `framer-motion` (now `motion`) is the standard pick for exactly this kind of "subtle, physics-based" polish and plays well with Tailwind.

## 6. Responsive Form Behavior

- **Breakpoint strategy**: desktop = split-pane (form left, sticky preview right); tablet = stacked with preview pinned to top and collapsing on scroll; mobile = full accordion form with preview accessible via a toggle or bottom sheet rather than always-visible (screen real estate is tight).
- **Bottom sheet for mobile preview**: swipe-up sheet showing the live SVG + copy buttons, so users don't have to scroll past the whole form to see/copy their result.
- **Touch target sizing**: buttons/inputs at least 44px tall on mobile (GitHub's own mobile web follows this), larger tap area on the color swatches and font list items.
- **Sticky action bar on mobile**: "Copy Markdown" / "Copy SVG URL" pinned to the bottom of the viewport once a config is valid, instead of buried at the bottom of a long form.
- **Font combobox on mobile**: full-screen search overlay (like GitHub's own mobile search) rather than a cramped inline dropdown.
- **Test at actual GitHub README width**: since the end destination is a README, preview the SVG at the ~800px content width GitHub renders READMEs at, not just full browser width.

## 7. Export & Integration

- **Multiple export formats**: SVG (current), plus a rendered GIF/WEBP fallback for platforms that don't support animated SVG embeds.
- **Direct embed generator improvements**: auto-generate the GitHub-README-ready markdown *and* a raw `<img>` HTML tag *and* a Hugo/Jekyll shortcode variant.
- **API endpoint documentation page**: if `/api/route.ts` exposes a public param-based endpoint (typical for these tools, e.g. `?text=...&font=...`), add a dedicated `/docs` page listing every query param with examples — this is often the *actual* most-used feature since people just hotlink the URL.
- **QR code / direct link share** for a generated config.

## 8. Quality / Technical

- **Accessibility pass**: label every input properly, keyboard-navigable font combobox, sufficient contrast, `aria-live` region for the preview updating.
- **Performance**: debounce live-preview regeneration so fast typing doesn't hammer re-renders; lazy-load the font list rather than blocking on it.
- **SEO/OG tags**: proper Open Graph image + meta description now that it's rebranded, so shared links look good.
- **Analytics-free usage counter (optional)**: if you want a "X SVGs generated" stat like the original had, do it without third-party trackers.

## 9. Stretch / "Nice to Have"

- **Community gallery**: opt-in showcase of configs people have made (needs backend/DB — bigger lift).
- **Versioned config export**: download/upload a JSON config file to reuse a setup outside the URL bar.
- **Multi-SVG batch export**: generate several variants at once (e.g. for A/B testing a README banner).

---

### Suggested phase order
1. GitHub Primer design tokens + component restyle (buttons, inputs, panels, octicons) — this is the foundation everything else sits on top of
2. Font autocomplete + split-pane live preview + presets
3. Motion/micro-interactions pass + responsive/mobile pass
4. README preview mode + command palette
5. New animation/style features (gradient text, cursors, pause/vanish)
6. Export polish + API docs page
7. Stretch features
