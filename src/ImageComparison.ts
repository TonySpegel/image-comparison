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
  slidingActive = false;

  @state()
  private pressed = false;

  @state()
  private sliderPosition: string = 'calc(50% - calc(var(--thumb-size) / 2))';

  private setPressed(val: boolean): void {
    this.pressed = val;
  }

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

  private slideCompare(event: MouseEvent | TouchEvent): void {
    if (this.slidingActive) {
      let pos = this.getHorizontalCursorPosition(event);

      if (pos < 0) pos = 0;
      if (pos > this.imageContainerWidth) pos = this.imageContainerWidth;

      this.sliderPosition = `calc(${pos}px - calc(var(--thumb-size) / 2))`;
      this.overlay = dynamicOverlayClipPath(pos, 'px');
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

  private resizeHandler(): void {
    this.getContainerLeftPlusWidth();
    this.centerSlider();
    this.setSlidingState(false);
  }

  private centerSlider(): void {
    this.overlay = dynamicOverlayClipPath(50, '%');
    this.sliderPosition = 'calc(50% - calc(var(--thumb-size) / 2))';
  }

  /**
   * Extract the left and width value of imageContainer
   */
  private getContainerLeftPlusWidth() {
    const { left, width } = this.imageContainer.getBoundingClientRect();
    this.imageContainerLeft = left;
    this.imageContainerWidth = width;
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

      window.addEventListener('resize', this.resizeHandler);
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

    window.removeEventListener('resize', this.resizeHandler);
  }

  constructor() {
    super();

    this.slideCompareHandler = this.slideCompareHandler.bind(this);
    this.slideEndHandler = this.slideEndHandler.bind(this);
  }

  /**
   * Because slider EventListener are only added when the
   * 'variant' attribute is set to 'slider',
   * you also have to react to changes of it when it later takes this value
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
      <div id="image-container" role="separator" title=${this.sliderPrompt}>
        <div id="one" style="${this.overlay}">
          <slot name="img-slide-2"></slot>
        </div>
        <div id="two">
          <slot name="img-slide-1"></slot>
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
          @dblclick=${this.centerSlider}
          style="left: ${this.sliderPosition}"
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

    return html`
      ${choose<Variants, TemplateResult>(this.variant, [
        ['slider', () => sliderTemplate],
        ['overlay', () => overlayTemplate],
        ['split', () => splitTemplate],
      ])}
    `;
  }

  /**
   * Called after the component's DOM has been updated the first time,
   * immediately before updated() is called. Best for performing
   * one-time work after the component's DOM has been created.
   */
  firstUpdated(): void {
    this.getContainerLeftPlusWidth();
  }
}
