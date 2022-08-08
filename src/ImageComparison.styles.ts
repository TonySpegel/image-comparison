/**
 * <image-comparison>
 * Compare two images using a slider, an overlay, or a side by side view.
 *
 * Styles ✨
 *
 * Copyright © 2022 Tony Spegel
 */

import { css } from 'lit';

export default css`
  :host {
    --base-gap: 16px;
    --split-gap: var(--base-gap);

    --thumb-size: 40px;
    --thumb-border-width: 3px;
    --bar-width: var(--thumb-border-width);
    --slider-color: #fff;
    --slider-color-active: #fff;

    display: block;
    box-sizing: border-box;
  }

  :host([variant='split']) #image-container {
    gap: var(--split-gap);
    grid-template-columns: 1fr 1fr;
  }

  :host([variant='overlay']) {
    cursor: pointer;
  }

  #image-container.pressed ::slotted(*:last-child) {
    order: 1;
  }

  :host([variant='overlay']) ::slotted(img) {
    grid-area: images;
  }


  #image-container {
    display: grid;
    grid-template-areas: 'images';
    position: relative;
    overflow: hidden;
  }

  button {
    position: relative;
    z-index: 3;

    border: var(--thumb-border-width) solid var(--slider-color);
    border-radius: 50%;
    width: var(--thumb-size);
    aspect-ratio: 1;

    align-self: center;

    grid-area: images;

    cursor: col-resize;
    background-color: transparent;
  }

  button:is(:focus, :hover) {
    border-color: var(--slider-color-active);
  }

  button:is(:focus, :hover):before,
  button:is(:focus, :hover):after {
    background-color: var(--slider-color-active);
  }

  button:before,
  button:after {
    content: '';
    width: var(--bar-width);
    left: calc(50% - calc(var(--bar-width) / 2));
    background-color: var(--slider-color);
    position: absolute;
    height: 100vh;
    z-index: -1;
  }

  button:before {
    bottom: calc(
      50% + calc(var(--thumb-size) / 2) - calc(var(--thumb-border-width) / 2)
    );
  }

  button:after {
    top: calc(var(--thumb-size) - var(--thumb-border-width));
  }

  #one {
    will-change: clip;
    z-index: 2;
    pointer-events: none;
    overflow: hidden;
  }

  #one,
  #two {
    grid-area: images;
  }
`;
