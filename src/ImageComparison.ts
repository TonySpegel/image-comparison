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

const dynamicOverlayClipPath = (
  xPosValue: number,
  xPosUnit: string = '%'
): string => {
  const xPos = `${xPosValue}${xPosUnit}`;
  return `clip-path: polygon(${xPos} 0%, 100% 0%, 100% 100%, ${xPos} 100%);`;
};

export class ImageComparison extends LitElement {
  static styles: CSSResultGroup = styles;

  private imageContainerWidth: number = 0;

  private imageContainerLeft: number = 0;

  @property({ type: String })
  private variant: Variants = 'overlay';

  @property({ type: String })
  private overlayPrompt = 'Tap and hold to compare';

  @property({ type: String })
  private sliderPrompt = 'Move the slider to compare';

  @query('#image-container')
  private imageContainer!: HTMLDivElement;

  @state()
  private overlay: string = dynamicOverlayClipPath(50, '%');

  @state()
  private slidingActive = false;

  @state()
  private pressed = false;

  @state()
  private sliderPosition: string = 'calc(50% - calc(var(--thumb-size) / 2))';

  private getHorizontalCursorPosition(
    dragEvent: MouseEvent | TouchEvent
  ): number {
    // Handle MouseEvent
    if (dragEvent instanceof MouseEvent) {
      return dragEvent.pageX - this.imageContainerLeft - window.scrollX;
    }
    // Handle TouchEvent
    return (
      dragEvent.changedTouches[0].pageX -
      this.imageContainerLeft -
      window.scrollX
    );
  }

  private finishSliding(): void {
    this.slidingActive = false;
  }

  private slideCompare(event: MouseEvent | TouchEvent): false | null {
    if (this.slidingActive === false) return false;

    let pos = this.getHorizontalCursorPosition(event);

    if (pos < 0) pos = 0;
    if (pos > this.imageContainerWidth) pos = this.imageContainerWidth;

    this.sliderPosition = `calc(${pos}px - calc(var(--thumb-size) / 2))`;
    this.overlay = dynamicOverlayClipPath(pos, 'px');

    return null;
  }

  private setPressed(val: boolean): void {
    this.pressed = val;
  }

  constructor() {
    super();

    this.finishSliding = this.finishSliding.bind(this);
    this.slideCompare = this.slideCompare.bind(this);
  }

  firstUpdated(): void {
    /**
     * Extract the left and width value of imageContainer
     */
    if (this.variant === 'slider') {
      const { left, width } = this.imageContainer.getBoundingClientRect();
      this.imageContainerLeft = left;
      this.imageContainerWidth = width;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener('mousemove', event => {
      this.slideCompare(event);
    });

    window.addEventListener('touchmove', event => {
      this.slideCompare(event);
    });

    window.addEventListener('mouseup', () => this.finishSliding());
    window.addEventListener('touchend', () => this.finishSliding());
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
     */
    const sliderTemplate = html`
      <div id="image-container" role="separator" title=${this.sliderPrompt}>
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
          @touchstart=${(event: TouchEvent) => {
            event.preventDefault();
            this.slidingActive = true;
          }}
          @touchmove=${(e: TouchEvent) => this.slideCompare(e)}
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
