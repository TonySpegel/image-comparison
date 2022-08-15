# `<image-comparison>`

Compare two images using a slider, an overlay, or a side by side view.  
This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i image-comparison-component
```

## Usage

```html
<script type="module">
  import 'image-comparison/image-comparison.js';
</script>

<!-- 
  Choose one of the displayed values in the 'variant' attribute
  to change the appeareance and functionality of <image-comparison>
-->
<image-comparison variant="slider|overlay|split">
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

### Slots
Slots allow you to define placeholders in your template that can be filled with any markup fragment you want.
They are identified by their name attribute. These placeholder are meant to be used to display the images and
you want to compare and their associated labels. Pleace add an `alt`-attribute to describe your images.

| Name            | Example value                                                                   |
|-----------------|---------------------------------------------------------------------------------|
| `label-before`  | `<label slot="label-before">Original</label>`                                   |
| `label-after`   | `<label slot="label-after">After</label>`                                       |
| `image-before`  | `<img slot="image-before" src="kasimir.jpg" alt="kasimir" />`                   |
| `image-after`   | `<img slot="image-after" src="kasimir_filter.jpg" alt="kasimir with filter" />` |

### Attributes
| Name            | Default                      | Description                                                                                              |
|-----------------|------------------------------|----------------------------------------------------------------------------------------------------------|
| `variant`       | `slider`                     | Defines the look and behaviour of this component.<br>Can be one of these: `slider`, `overlay`, `split`   |
| `overlayPrompt` | `Tap and hold to compare`    | CSS class which is added to / removed from `tocLinkSelector`                                             |
| `sliderPrompt`  | `Move the slider to compare` | The intersection for your TOC items.                                                                     |

### CSS variables
Select and set the following variables to further customize this component
```css
image-comparison {
  --thumb-size: 30px;
}
```
| Variable                     | Purpose                                                        | Default value                 |
|------------------------------|----------------------------------------------------------------|-------------------------------|
| `--base-gap`                 | Spacing for paddings, margins & gaps                           | `16px`                        |
| `--base-radius`              | Border radius for different elements                           | `8px`                         |
| variant: `slider`            |
| `--thumb-size`               | The size of the button which moves the slider                  | `40px`                        |
| `--thumb-border-width`       | The size of the button which moves the slider                  | `3px`                         |
| `--thumb-bar-width`          | The size of the button which moves the slider                  | `--thumb-border-width`: `3px` |
| `--slider-color`             | The size of the button which moves the slider                  | `#fff`                        |
| `--slider-color-active`      | The size of the button which moves the slider                  | `#fff`                        |
| `--slider-color-active`      | The size of the button which moves the slider                  | `#fff`                        |
| `--label-background-color`   | The size of the button which moves the slider                  | `#fff`                        |
| `--label-color`              | The size of the button which moves the slider                  | `#000`                        |
| `--label-radius`             | The size of the button which moves the slider                  | `--base-radius`: `8px`        |
| variant: `split`             |
| `--split-gap`                | Gap between images when the variant attribute is set to 'split'| `--base-gap`: `16px` |


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

Useful resources:

- ["What is Lit?" on the lit.dev site for more information](https://lit.dev/docs/)
