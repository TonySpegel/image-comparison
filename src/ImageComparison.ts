/**
 * <image-comparison> is a web component which enables
 * users to switch between themes.
 *
 * Copyright © 2021 Tony Spegel
 */

import { html, css, LitElement, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';

type Variants = 'overlay' | 'slider' | 'split';

export class ImageComparison extends LitElement {
  static styles = css`
    :host {
      --base-gap: 16px;
      --split-gap: var(--base-gap);

      --thumb-size: 40px;
      --thumb-border-width: 3px;
      --bar-width: 2px;
      --slider-color: white;

      display: block;
      padding: var(--base-gap);
      box-sizing: border-box;
    }

    :host([variant='split']) #image-container {
      gap: var(--base-gap);
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    :host([variant='overlay']) #image-container {
      cursor: pointer;
    }

    button {
      border: var(--thumb-border-width) solid var(--slider-color);
      border-radius: 50%;
      width: var(--thumb-size);
      aspect-ratio: 1;

      place-self: center;
      background-color: transparent;
      grid-area: images;
      z-index: 3;
      cursor: col-resize;
      position: relative;
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

    #image-container {
      display: grid;
      grid-template-areas: 'images';
      position: relative;
      overflow: hidden;
    }

    #image-container.pressed ::slotted(*:last-child) {
      order: -1;
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
      background-color: red;
    }
  `;

  @state()
  pressed = false;

  @state()
  x = 50;

  @property({ type: String })
  variant: Variants = 'overlay';

  @property({ type: String })
  overlayPrompt = 'Tap and hold to compare';

  render() {
    /**
     * Overlay
     * ┌────┐
     * │    │
     * └────┘
     */
    const overlayTemplate = html`
      <div
        @mousedown=${() => (this.pressed = true)}
        @mouseup=${() => (this.pressed = false)}
        @touchstart=${(event: Event) => {
          event.preventDefault();
          this.pressed = true;
        }}
        @touchend=${(event: Event) => {
          event.preventDefault();
          this.pressed = false;
        }}
        title=${this.overlayPrompt}
        id="image-container"
        class="${this.pressed ? 'pressed' : ''}"
      >
        <slot name="img-slide-1"></slot>
        <slot name="img-slide-2"></slot>
      </div>
      <slot name="prompt"></slot>
    `;
    /**
     * Split view
     * ┌────┬────┐
     * │    │    │
     * └────┴────┘
     */
    const splitTemplate = html`
      <div id="image-container">
        <slot name="img-slide-1"></slot>
        <slot name="img-slide-2"></slot>
      </div>
    `;
    /**
     * Slider
     * ┌───┬─────┐
     * │  <│>    │
     * └───┴─────┘
     */
    const sliderTemplate = html`
      <div>
        <div id="image-container">
          <div
            id="one"
            style="clip-path: polygon(${this.x}% 0%, 100% 0%, 100% 100%, ${this
              .x}% 100%);"
          >
            <slot name="img-slide-1"></slot>
          </div>
          <div id="two">
            <slot name="img-slide-2"></slot>
          </div>
          <button
            @mousemove=${(e: Event) => {
              console.log(e);
            }}
            style="transform: translateX(${this.x}%)"
          ></button>
        </div>

        <input
          @input=${(e: Event) => {
            const sliderValue = (e.target as HTMLInputElement).value;
            this.x = parseInt(sliderValue);
          }}
          type="range"
          min="0"
          max="100"
          value="50"
        />
      </div>
    `;

    return html`
      ${choose<Variants, TemplateResult>(this.variant, [
        ['slider', () => sliderTemplate],
        ['overlay', () => overlayTemplate],
        ['split', () => splitTemplate],
      ])}
    `;
  }
}
