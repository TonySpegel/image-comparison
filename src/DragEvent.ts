/**
 * Copyright © 2022 Tony Spegel
 */

export class DragEvent extends Event {
  static readonly eventName = 'drag-event' as const;

  targetElement: HTMLElement;

  constructor(targetElement: HTMLElement) {
    super(DragEvent.eventName, {
      bubbles: true,
      cancelable: false,
      composed: true,
    });

    this.targetElement = targetElement;
  }
}
