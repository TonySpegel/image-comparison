/**
 * <image-comparison>
 * Compare two images using a slider, an overlay, or a side by side view.
 *
 * Styles ✨
 *
 * Copyright © 2023 Tony Spegel
 */

import { css } from 'lit';

export default css`
  :host {
    --base-gap: 16px;
    --base-radius: 8px;

    --slider-color: #fff;
    --slider-color-active: #fff;

    --overlay-focus-color: initial;
    --overlay-focus-offset: calc(var(--base-gap) / 2);

    --split-gap: var(--base-gap);
    --split-column-min-width: 100px;
    --split-column-max-width: 1fr;

    --thumb-size: 40px;
    --thumb-border-width: 3px;
    --thumb-bar-width: var(--thumb-border-width);

    --label-background-color: #fff;
    --label-color: #000;
    --label-radius: var(--base-radius);

    display: block;
    box-sizing: border-box;
  }

  #image-container {
    display: grid;
    grid-template-areas: 'images';
    position: relative;
    overflow: hidden;
  }

  /**
   * Labels
   */
  ::slotted([slot^='label-']) {
    grid-area: images;
    z-index: 4;

    margin: calc(var(--base-gap) / 2);
    border-radius: var(--label-radius);
    padding: calc(var(--base-gap) / 4) calc(var(--base-gap) / 2);

    line-height: 1;

    opacity: 0;
    transition: opacity 0.3s ease-out;

    background-color: var(--label-background-color);
    color: var(--label-color);
  }

  ::slotted([slot^='image-']) {
    max-inline-size: 100%;
  }

  :host(:is([variant='slider'], [variant='overlay']))
    ::slotted([slot^='label-']) {
    align-self: flex-end;
  }

  /**
   * Slider
   * ===============================================
   */
  :host([variant='slider'])
    #image-container:is(:hover, :focus-within, .sliding-active)
    ::slotted([slot^='label-']) {
    opacity: 1;
  }

  :host([variant='slider']) ::slotted([slot='label-before']) {
    justify-self: flex-start;
  }

  :host([variant='slider']) ::slotted([slot='label-after']) {
    justify-self: flex-end;
  }

  #image-container.rtl button {
    transform: translateX(50%);
  }

  #container-after {
    will-change: clip;
    z-index: 2;
    pointer-events: none;
    overflow: hidden;
  }

  #container-before,
  #container-after {
    grid-area: images;
  }

  button {
    position: relative;
    z-index: 3;

    border: var(--thumb-border-width) solid var(--slider-color);
    border-radius: 50%;
    width: var(--thumb-size);
    transform: translateX(-50%);

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
    width: var(--thumb-bar-width);
    left: calc(50% - calc(var(--thumb-bar-width) / 2));
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

  /**
   * Overlay
   * ===============================================
   */
  :host([variant='overlay']) {
    cursor: pointer;
  }

  :host([variant='overlay']) #image-container {
    outline-color: var(--overlay-focus-color);
    outline-offset: var(--overlay-focus-offset);
  }

  :host([variant='overlay']) ::slotted(img),
  :host([variant='overlay']) ::slotted(picture) {
    grid-area: images;
  }

  /* Switch order of images */
  #image-container.pressed ::slotted([slot='image-after']) {
    order: 1;
  }

  :host([variant='overlay'])
    #image-container:hover
    ::slotted([slot='label-before']) {
    opacity: 1;
  }

  #image-container.pressed ::slotted([slot='label-before']) {
    opacity: 0;
  }

  #image-container.pressed ::slotted([slot='label-after']) {
    opacity: 1;
  }

  :host([variant='overlay'])
    #image-container.pressed:hover
    ::slotted([slot='label-before']) {
    opacity: 0;
  }

  :host([variant='overlay']) ::slotted([slot^='label-']) {
    justify-self: center;
  }

  /**
   * Split
   * ===============================================
   */
  :host([variant='split']) #image-container {
    gap: var(--split-gap);
    grid-template-columns: repeat(
      auto-fit,
      minmax(var(--split-column-min-width), var(--split-column-max-width))
    );
  }

  :host([variant='split']) .container-split-column {
    display: flex;
    flex-direction: column;
  }

  :host([variant='split']) ::slotted([slot^='label-']) {
    opacity: 1;
  }
`;
