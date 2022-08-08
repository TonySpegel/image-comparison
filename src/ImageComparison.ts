/**
 * <image-comparison>
 * Compare two images using a slider, an overlay, or a side by side view
 *
 * Copyright © 2022 Tony Spegel
 */

import type { CSSResultGroup } from 'lit';

import { choose } from 'lit/directives/choose.js';
import { html, LitElement, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import styles from './ImageComparison.styles';

type Variants = 'overlay' | 'slider' | 'split';

const clipPath = (
  xPosValue: number | string,
  xPosUnit: string = '%'
): string => {
  const xPos = `${xPosValue}${xPosUnit}`;
  return `clip-path: polygon(${xPos} 0%, 100% 0%, 100% 100%, ${xPos} 100%);`;
};

export class ImageComparison extends LitElement {
  static styles: CSSResultGroup = styles;

  private imageContainerWidth: number = 0;

  private imageContainerLeft: number = 0;

  @state()
  pressed = false;

  @state()
  sliderPosition: number | string = 'calc(50% - calc(var(--thumb-size) / 2))';

  @property({ type: String, reflect: true })
  variant: Variants = 'overlay';

  @property({ type: String })
  overlayPrompt = 'Tap and hold to compare';

  @property({ type: String })
  sliderPrompt = 'Move to compare';

  @query('#image-container')
  private imageContainer!: HTMLDivElement;

  @state()
  private overlay = clipPath('50', '%');

  @state()
  slidingActive = false;

  getHorizontalCursorPosition(event: MouseEvent): number {
    // the relative x position to your window
    return event.pageX - this.imageContainerLeft - window.scrollX;
  }

  finishSliding() {
    this.slidingActive = false;
  }

  slideCompare(event: MouseEvent) {
    if (this.slidingActive === false) return false;

    let pos = this.getHorizontalCursorPosition(event);

    if (pos < 0) pos = 0;
    if (pos > this.imageContainerWidth) pos = this.imageContainerWidth;

    this.sliderPosition = `calc(${pos}px - calc(var(--thumb-size) / 2))`;
    this.overlay = clipPath(pos, 'px');
  }

  setPressed(val: boolean) {
    this.pressed = val;
  }

  constructor() {
    super();

    this.finishSliding = this.finishSliding.bind(this);
    this.slideCompare = this.slideCompare.bind(this);
  }

  firstUpdated() {
    const { left, width } = this.imageContainer.getBoundingClientRect();

    this.imageContainerWidth = width;
    this.imageContainerLeft = left;
  }

  override connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener('mousemove', event => this.slideCompare(event));
    window.addEventListener('mouseup', () => this.finishSliding());
  }

  /**
   * Clean up EventListeners
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();

    window.removeEventListener('mousemove', this.slideCompare);
    window.removeEventListener('mouseup', this.finishSliding);
  }

  render() {
    /**
     * Overlay
     * ┌────┐
     * │    │
     * └────┘
     */
    const overlayTemplate = html`
      <div
        @mousedown=${() => this.setPressed(true)}
        @mouseup=${() => this.setPressed(false)}
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
        <slot name="img-slide-2"></slot>
        <slot name="img-slide-1"></slot>
      </div>
      <slot name="prompt"></slot>
    `;
    /**
     * Split view
     * ┌────┐┌────┐    ┌────┬────┐
     * │    ││    │ || │    │    │
     * └────┘└────┘    └────┴────┘
     * ^ --split-gap
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
     aria-valuenow=${this.sliderPosition}
     */
    const sliderTemplate = html`
      <div id="image-container" role="separator">
        <div id="one" style="${this.overlay}">
          <slot name="img-slide-2"></slot>
        </div>
        <div id="two">
          <slot name="img-slide-1"></slot>
        </div>
        <button
          @mousedown=${() => {
            this.slidingActive = true;
          }}
          @mousemove=${(e: MouseEvent) => this.slideCompare(e)}
          style="left: ${this.sliderPosition}"
        ></button>
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
