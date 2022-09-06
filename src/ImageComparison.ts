/**
 * <image-comparison>
 * Compare two images using a slider, an overlay, or a side by side view
 *
 * Copyright © 2022 Tony Spegel
 */

import type { CSSResultGroup } from 'lit';

import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';
import { html, LitElement, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { DragEvent, PressEvent } from './index.js';
import styles from './ImageComparison.styles.js';

type Variants = 'overlay' | 'slider' | 'split';

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

  /**
   * Applied when shift is pressed with an arrow key (variant 'slider')
   */
  @property({ type: Number })
  private sliderSteps: number = 5;

  @query('#image-container')
  private imageContainer!: HTMLDivElement;

  @state()
  private slidingActive = false;

  @state()
  private isRtl: boolean = false;

  @state()
  private pressed = false;

  private readingDirectionObserver!: MutationObserver;

  private setPressed(value: boolean): void {
    this.pressed = value;
    window.dispatchEvent(new PressEvent(this, value));
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

  /**
   * Converts 'cursor' position and updates the UI accordingly
   */
  private slideCompare(event: MouseEvent | TouchEvent): void {
    if (this.slidingActive) {
      let pos = this.convertCursorToSliderPosition(event);
      pos = this.isRtl ? 100 - pos : pos;

      this.sliderPosition = pos;
    }
  }

  private slideCompareHandler(event: MouseEvent | TouchEvent): void {
    this.slideCompare(event);
  }

  private setSlidingState(val: boolean): void {
    this.slidingActive = val;
  }

  private slideEndHandler(): void {
    this.setSlidingState(false);
    window.dispatchEvent(new DragEvent(this));
  }

  /**
   * Callback to handle any mutations made to the dir-attribute
   */
  private readingDirectionHandler(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'dir') {
        const { dir } = mutation.target as Document;
        this.isRtl = dir === 'rtl';
      }
    }
  }

  /**
   * Used with overlay variant to compare images
   * with the 'Space' or 'Enter' key
   */
  private keyboardOverlayHandler(event: KeyboardEvent): void {
    event.preventDefault();
    const { key, code } = event;

    if (code === 'Space' || key === 'Enter') {
      this.pressed = true;
    }
  }

  /**
   * Handle arrow, home & end keys and use more steps when shift is pressed
   */
  private keyboardHandler(event: KeyboardEvent): void {
    event.preventDefault();
    const { key, shiftKey } = event;
    const { isRtl } = this;
    const isLtr = !isRtl;
    const steps = shiftKey ? this.sliderSteps : 1;

    let position = this.sliderPosition;

    if ((key === 'ArrowLeft' && isLtr) || (key === 'ArrowRight' && isRtl)) {
      position -= steps;
    }

    if ((key === 'ArrowRight' && isLtr) || (key === 'ArrowLeft' && isRtl)) {
      position += steps;
    }

    // Also often called 'Pos1'
    if (key === 'Home') {
      position = 0;
    }

    if (key === 'End') {
      position = 100;
    }

    this.sliderPosition = clamp(position, 0, 100);
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
    this.readingDirectionHandler = this.readingDirectionHandler.bind(this);
    this.keyboardHandler = this.keyboardHandler.bind(this);
  }

  /**
   * Because slider EventListeners are only added when the
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

    if (name === 'variant' && newVal !== oldVal && newVal === 'overlay') {
      this.removeSliderEventListener();
    }
  }

  /**
   * Component is added to the document's DOM,
   * add EventListeners for variant 'slider' and setup readingDirectionObserver
   */
  override connectedCallback(): void {
    super.connectedCallback();

    this.addSliderEventListener();

    this.readingDirectionObserver = new MutationObserver(
      this.readingDirectionHandler
    );

    this.readingDirectionObserver.observe(
      this.ownerDocument?.querySelector('html')!,
      { attributes: true }
    );
  }

  /**
   * Clean up EventListeners
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeSliderEventListener();
    this.readingDirectionObserver.disconnect();
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
        class=${classMap({
          'sliding-active': this.slidingActive,
          rtl: this.isRtl,
        })}
      >
        <slot name="label-before"></slot>
        <slot name="label-after"></slot>

        <div id="container-before">
          <slot name="image-before"></slot>
        </div>
        <div
          id="container-after"
          style=${this.isRtl
            ? `clip-path: inset(0 ${this.sliderPosition}% 0 0)`
            : `clip-path: inset(0 0 0 ${this.sliderPosition}%)`}
        >
          <slot name="image-after"></slot>
        </div>

        <button
          @keydown=${this.keyboardHandler}
          @keyup=${() => this.setSlidingState(false)}
          @mousedown=${() => {
            this.setSlidingState(true);
          }}
          @mousemove=${(e: MouseEvent) => this.slideCompareHandler(e)}
          @touchstart=${(event: TouchEvent) => {
            event.preventDefault();
            this.setSlidingState(true);
          }}
          @touchmove=${(e: TouchEvent) => this.slideCompareHandler(e)}
          @dblclick=${() => {
            this.sliderPosition = 50;
          }}
          style="left: ${this.isRtl
            ? -this.sliderPosition
            : this.sliderPosition}%"
          title=${this.sliderPrompt}
          aria-controls="image-container"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${this.sliderPosition}
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
        @keydown=${this.keyboardOverlayHandler}
        @keyup=${() => {
          this.setPressed(false);
        }}
        @mousedown=${() => {
          this.setPressed(true);
        }}
        @mouseup=${() => {
          this.setPressed(false);
        }}
        @mouseleave=${() => {
          this.setPressed(false);
        }}
        @touchstart=${(event: Event) => {
          event.preventDefault();
          this.setPressed(true);
        }}
        @touchend=${(event: Event) => {
          event.preventDefault();
          this.setPressed(false);
        }}
        tabindex="0"
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
        <div class="container-split-column">
          <slot name="image-before"></slot>
          <slot name="label-before"></slot>
        </div>
        <div class="container-split-column">
          <slot name="image-after"></slot>
          <slot name="label-after"></slot>
        </div>
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
