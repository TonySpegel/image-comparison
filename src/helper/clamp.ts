/**
 * Simple clamp
 *
 * Copyright © 2022 Tony Spegel
 */

export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max);
