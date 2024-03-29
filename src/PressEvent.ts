/**
 * Copyright © 2023 Tony Spegel
 */

/**
 * @summary An event that is emitted whenever an overlay is pressed.
 */
export class PressEvent extends Event {
  static readonly eventName = 'press-event' as const;

  targetElement: HTMLElement;

  pressed: boolean = false;

  constructor(targetElement: HTMLElement, pressed: boolean) {
    super(PressEvent.eventName, {
      bubbles: true,
      cancelable: false,
      composed: true,
    });

    this.targetElement = targetElement;
    this.pressed = pressed;
  }
}
