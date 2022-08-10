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
  <!-- First/before/untouched image -->
  <img slot="img-slide-1" src="../assets/kasimir.jpg" alt="kasimir" />
  <!-- Second/after/touched image -->
  <img
    slot="img-slide-2"
    src="../assets/kasimir_filter.jpg"
    alt="kasimir with filter applied"
  />
</image-comparison>
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

## Inspiration

Some websites I took inspiration from:

- [gpucheck.de](https://gpucheck.de/rtx-on-vs-off-slideshow-vergleich/)
- [w3schools.com](https://www.w3schools.com/howto/howto_js_image_comparison.asp)
- [mobirise-tutorials.com](https://www.mobirise-tutorials.com/LawyerM4-Tutorials/image-comparison.html)
