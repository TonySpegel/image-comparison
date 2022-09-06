/**
 * Copyright © 2022 Tony Spegel
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
