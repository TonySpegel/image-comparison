# `<image-comparison>`

Compare two images using a slider, an overlay, or a side by side split view.  
This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Features
- three variants available: [slider](#slider), [overlay](#overlay), [split](#split)
- Right-to-left language support (document's `dir` attribute set to `ltr`/`rtl`)  
- Keyboard controls: 
  - Slider: 
    - <kbd>←</kbd> / <kbd>→</kbd> move in small steps
    - <kbd>Shift + ←/→</kbd> for increased [steps](#attributes)
    - (<kbd>Home</kbd> / <kbd>Pos1</kbd>) / <kbd>End</kbd>, <kbd>⌘/Ctrl + ←/→ </kbd> to jump left or right
  - Overlay: when in focus press <kbd>Enter</kbd> / <kbd>Space</kbd> 
- [Custom events](#custom-events)
- Support for [labels](#slots) and [custom prompts](#attributes)
- Further customization through [CSS variables](#css-variables)
- Runs ✨everywhere✨ because it's a webcomponent

## Installation

```bash
npm i image-comparison-component
```

## Usage

### Import

```javascript
// Script
<script type="module">
  import 'image-comparison/image-comparison.js';
</script>

// Bundler
import 'image-comparison/image-comparison.js';
```

### Slider

```html
<image-comparison variant="slider">
  <label slot="label-before">Original</label>
  <label slot="label-after">Vogue Filter</label>

  <img slot="image-before" src="kasimir.jpg" alt="kasimir" />
  <img
    slot="image-after"
    src="kasimir_filter.jpg"
    alt="kasimir with the vogue filter applied"
  />
</image-comparison>
```

### Overlay
The "overlay" variant can be used to compare images with a tap/press and hold action or pressing 
the <kbd>Enter</kbd> / <kbd>Space</kbd> key when in focus. Its focus-ring offset can be adjusted using the
`--overlay-focus-offset` variable.

### Split

![side by side split view variant](https://user-images.githubusercontent.com/1145514/188476603-60f377b4-3640-4144-aea7-f691c34bb126.png)

"Split" is the simplest of the three variants, as it simply displays both images side by side or one below the other, 
and does not provide any form of interaction. 
You can set its columns minimum and maximum width (`--split-column-min-width`, `--split-column-max-width`) 
as well as its column spacing (`--split-gap`). At least one of the column variables must be a fixed length.

### Slots
Slots allow you to define placeholders in your template that can be filled with any markup fragment you want.
They are identified using the 'slot' attribute. These placeholder are meant to be used to display the images you want to compare and their associated labels. Pleace add an `alt`-attribute to describe your images.

| Name            | Example value                                                                   |
|-----------------|---------------------------------------------------------------------------------|
| `label-before`  | `<label slot="label-before">Original</label>`                                   |
| `label-after`   | `<label slot="label-after">After</label>`                                       |
| `image-before`  | `<img slot="image-before" src="kasimir.jpg" alt="kasimir" />`                   |
| `image-after`   | `<img slot="image-after" src="kasimir_filter.jpg" alt="kasimir with filter" />` |

### Attributes
| Name            | Default                      | Description                                                                   |
|-----------------|------------------------------|-------------------------------------------------------------------------------|
| `variant`       | `slider`                     | Defines the look and behaviour of this component: `slider`, `overlay`, `split`|
| `overlayPrompt` | `Tap and hold to compare`    | -                                                                             |
| `sliderPrompt`  | `Move the slider to compare` | -                                                                             |
| `sliderSteps`   | `5`                          | Number of steps used with   <kbd>Shift + ArrowLeft/ArrowRight</kbd>           |
| `sliderPosition`| `50`                         | Current slider position expressed in percent                                  |

### CSS variables
Select and set the following variables to further customize this component

| Variable                     | Purpose                                                        | Default value                 |
|------------------------------|-----------------------------------------------|-------------------------------|
| `--base-gap`                 | Spacing for paddings, margins & gaps          | `16px`                        |
| `--base-radius`              | Border radius for different elements          | `8px`                         |
| variant: [slider](#slider)   |
| `--thumb-size`               | The size of the button which moves the slider | `40px`                        |
| `--thumb-border-width`       | -                                             | `3px`                         |
| `--thumb-bar-width`          | The divider width                             | `--thumb-border-width`: `3px` |
| `--slider-color`             | The color for the thumb button and bar        | `#fff`                        |
| `--slider-color-active`      | The color for active states                   | `#fff`                        |
| `--label-background-color`   | -                                             | `#fff`                        |
| `--label-color`              | -                                             | `#000`                        |
| `--label-radius`             | -                                             | `--base-radius`: `8px`        |
| variant: [overlay](#overlay) |
| `--overlay-focus-offset`     | Offset value for focus ring around the image  | `--base-gap / 2`              |
| variant: [split](#split)     |
| `--split-gap`                | Gap between images                            | `--base-gap`: `16px`          |
| `--split-column-min-width`   | Min width of a split column                   | `100px`                       |
| `--split-column-max-width`   | Max width of a split column                   | `1fr`                         |

Example usage:
```css
image-comparison {
  --thumb-size: 30px;
}
```

### Custom events
There are two custom events you can listen to:
```typescript
DragEvent {
  type: 'drag-event',
  targetElement {
    // ...
    sliderPosition: 73,
  }
}
```
and
```typescript
PressEvent {
  type: 'press-event',
  targetElement {},
  pressed: true
}
```
Example usage:
```javascript
window.addEventListener('press-event', (e) => console.log(e));
// PressEvent {isTrusted: false, pressed: false, targetElement: image-comparison, type: 'press-event', target: Window, …}
```

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`

## Inspiration & other useful resources

Some websites I took inspiration from:

- [gpucheck.de](https://gpucheck.de/rtx-on-vs-off-slideshow-vergleich/)
- [w3schools.com](https://www.w3schools.com/howto/howto_js_image_comparison.asp)
- [mobirise-tutorials.com](https://www.mobirise-tutorials.com/LawyerM4-Tutorials/image-comparison.html)
- [Shoelace](https://shoelace.style/) a framework agnostic ui library, checkout their own implementation of such a component: [Image Comparer](https://shoelace.style/components/image-comparer)

Useful resources:

- ["What is Lit?" on the lit.dev site for more information](https://lit.dev/docs/)
- [Open Web Components](https://open-wc.org/)
