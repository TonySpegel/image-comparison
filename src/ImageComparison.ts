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

const dynamicOverlayClipPath = (xPos: number): string => {
  return `clip-path: polygon(${xPos}% 0%, 100% 0%, 100% 100%, ${xPos}% 100%);`;
};

/**
 * Clamps a value between an upper and lower bound
 */
const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);

export class ImageComparison extends LitElement {
  static styles: CSSResultGroup = styles;

  /**
   * Defines the look and behaviour of <image-comparison>
   */
  @property({ type: String })
  private variant: Variants = 'slider';

  @property({ type: String })
  private overlayPrompt = 'Tap and hold to compare';

  @property({ type: String })
  private sliderPrompt = 'Move the slider to compare';

  @property({ type: Number, reflect: true })
  private sliderPosition: number = 50;

  @query('#image-container')
  private imageContainer!: HTMLDivElement;

  @state()
  private slidingActive = false;

  @state()
  private overlay: string = dynamicOverlayClipPath(50);

  @state()
  private pressed = false;

  private setPressed(val: boolean): void {
    this.pressed = val;
  }

  /**
   * The relative position of a cursor (as in: a touch or mouse device)
   * is converted into a clamped slider position value
   */
  convertCursorToSliderPosition(event: TouchEvent | MouseEvent): number {
    const { left, width } = this.imageContainer.getBoundingClientRect();
    const { scrollX } = window;
    const pageX =
      event instanceof MouseEvent ? event.pageX : event.changedTouches[0].pageX;
    const xOffset = left + scrollX;
    const x = pageX - xOffset;

    const sliderPostion = parseFloat(
      clamp((x / width) * 100, 0, 100).toFixed(2)
    );

    return sliderPostion;
  }

  private slideCompare(event: MouseEvent | TouchEvent): void {
    if (this.slidingActive) {
      const pos = this.convertCursorToSliderPosition(event);

      this.sliderPosition = pos;
      this.overlay = dynamicOverlayClipPath(pos);
    }
  }

  private setSlidingState(val: boolean): void {
    this.slidingActive = val;
  }

  private slideCompareHandler(event: MouseEvent | TouchEvent): void {
    this.slideCompare(event);
  }

  private slideEndHandler(): void {
    this.setSlidingState(false);
  }

  private centerSlider(): void {
    this.overlay = dynamicOverlayClipPath(50);
    this.sliderPosition = 50;
  }

  /**
   * Slider EventListener are added when 'variant' is set to 'slider'
   */
  private addSliderEventListener(): void {
    if (this.variant === 'slider') {
      // Moving the slider
      window.addEventListener('mousemove', this.slideCompareHandler);
      window.addEventListener('touchmove', this.slideCompareHandler);
      // Stop moving the slider
      window.addEventListener('mouseup', this.slideEndHandler);
      window.addEventListener('touchend', this.slideEndHandler);
    }
  }

  /**
   * Slider EventListener are removed when the element is removed from the DOM
   */
  private removeSliderEventListener(): void {
    // Moving the slider
    window.removeEventListener('mousemove', this.slideCompareHandler);
    window.removeEventListener('touchmove', this.slideCompareHandler);
    // End sliding
    window.removeEventListener('mouseup', this.slideEndHandler);
    window.removeEventListener('touchend', this.slideEndHandler);
  }

  constructor() {
    super();

    this.slideCompareHandler = this.slideCompareHandler.bind(this);
    this.slideEndHandler = this.slideEndHandler.bind(this);
  }

  /**
   * Because slider EventListener are only added when the
   * 'variant' attribute is set to 'slider', you also have to react to its changes
   */
  override attributeChangedCallback(
    name: string = 'variant',
    oldVal: string | null,
    newVal: Variants
  ) {
    super.attributeChangedCallback(name, oldVal, newVal);

    if (name === 'variant' && newVal !== oldVal && newVal === 'slider') {
      this.addSliderEventListener();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();

    this.addSliderEventListener();
  }

  /**
   * Clean up EventListeners
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeSliderEventListener();
  }

  render() {
    /**
     * Slider
     * ┌───┬─────┐
     * │  <│>    │
     * └───┴─────┘
     */
    const sliderTemplate = html`
      <pre>
sliderPosition: ${this.sliderPosition}
</pre>
      <div
        id="image-container"
        class=${this.slidingActive ? 'sliding-active' : ''}
      >
        <slot name="label-before"></slot>
        <slot name="label-after"></slot>

        <div id="container-after" style="${this.overlay}">
          <slot name="image-after"></slot>
        </div>
        <div id="container-before">
          <slot name="image-before"></slot>
        </div>
        <button
          @mousedown=${() => {
            this.setSlidingState(true);
          }}
          @mousemove=${(e: MouseEvent) => this.slideCompareHandler(e)}
          @touchstart=${(event: TouchEvent) => {
            event.preventDefault();
            this.setSlidingState(true);
          }}
          @touchmove=${(e: TouchEvent) => this.slideCompareHandler(e)}
          @keyup=${() => this.setSlidingState(false)}
          @dblclick=${this.centerSlider}
          style="left: ${this.sliderPosition}%"
          title=${this.sliderPrompt}
        ></button>
      </div>
    `;
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
        @mouseleave=${() => this.setPressed(false)}
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
        <slot name="label-before"></slot>
        <slot name="label-after"></slot>
        <slot name="image-after"></slot>
        <slot name="image-before"></slot>
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
        <slot name="label-before"></slot>
        <slot name="label-after"></slot>
        <slot name="image-before"></slot>
        <slot name="image-after"></slot>
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
