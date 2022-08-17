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

  private thumbSizeHalf: number = 0;

  private thumbBorderHalfWidth: number = 0;

  /**
   * Defines the look and behaviour of <image-comparison>
   */
  @property({ type: String })
  private variant: Variants = 'slider';

  @property({ type: String })
  private overlayPrompt = 'Tap and hold to compare';

  @property({ type: String })
  private sliderPrompt = 'Move the slider to compare';

  @query('#image-container')
  private imageContainer!: HTMLDivElement;

  @state()
  private slidingActive = false;

  @state()
  private sliderPosition: string = 'calc(50% - calc(var(--thumb-size) / 2))';

  @state()
  private overlay: string = dynamicOverlayClipPath(50, '%');

  @state()
  private pressed = false;

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

  // private resizeHandler(): void {
  //   this.getContainerLeftPlusWidth();
  //   this.centerSlider();
  //   this.setSlidingState(false);
  // }

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

    this.thumbSizeHalf =
      parseInt(
        getComputedStyle(this)
          .getPropertyValue('--thumb-size')
          .replace('px', ''),
        10
      ) / 2;

    this.thumbBorderHalfWidth =
      parseInt(
        getComputedStyle(this)
          .getPropertyValue('--thumb-border-width')
          .replace('px', ''),
        10
      ) / 2;

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
          @keydown=${(event: KeyboardEvent): void => {
            this.setSlidingState(true);

            const { left } = (
              event.target as HTMLButtonElement
            ).getBoundingClientRect();

            if (event.key === 'ArrowLeft') {
              let relativeLeft =
                left - this.imageContainerLeft - window.scrollX;

              if (
                relativeLeft <
                this.thumbSizeHalf * -1 - this.thumbBorderHalfWidth * -1
              )
                relativeLeft =
                  this.thumbSizeHalf * -1 - this.thumbBorderHalfWidth * -1;

              this.sliderPosition = `calc(${relativeLeft - 1}px)`;
              this.overlay = dynamicOverlayClipPath(
                relativeLeft + this.thumbSizeHalf - 1,
                'px'
              );
            }

            if (event.key === 'ArrowRight') {
              let relativeLeft =
                left - this.imageContainerLeft - window.scrollX;
              if (
                relativeLeft >
                this.imageContainerWidth -
                  this.thumbBorderHalfWidth -
                  this.thumbSizeHalf
              )
                relativeLeft =
                  this.imageContainerWidth -
                  this.thumbBorderHalfWidth -
                  this.thumbSizeHalf;

              this.sliderPosition = `calc(${relativeLeft + 1}px)`;

              this.overlay = dynamicOverlayClipPath(
                relativeLeft + this.thumbSizeHalf + 1,
                'px'
              );
            }
          }}
          @keyup=${() => this.setSlidingState(false)}
          @dblclick=${this.centerSlider}
          style="left: ${this.sliderPosition}"
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

  /**
   * Called after the component's DOM has been updated the first time,
   * immediately before updated() is called. Best for performing
   * one-time work after the component's DOM has been created.
   */
  firstUpdated(): void {
    this.getContainerLeftPlusWidth();
  }
}
