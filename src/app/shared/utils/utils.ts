import type { AreaPlugin } from 'rete-area-plugin';
import type { IAreaExtra, ISchemes } from '../types/rete-types';

/**
 * Calculates the center of the viewport in the editor area.
 *
 * This function takes into account the current transformation (zoom and pan)
 * applied to the area and computes the coordinates of the center of the viewport
 * relative to the area.
 *
 * @param {AreaPlugin<ISchemes, IAreaExtra>} area - The area plugin instance which contains the transformation and container information.
 * @returns {{ x: number, y: number }} The coordinates of the center of the viewport.
 */
export function getViewportCenter(area: AreaPlugin<ISchemes, IAreaExtra>): {
  x: number;
  y: number;
} {
  const { x, y, k } = area.area.transform;
  const box = area.container.getBoundingClientRect();
  const halfWidth = box.width / 2 / k;
  const halfHeight = box.height / 2 / k;

  return { x: halfWidth - x / k, y: halfHeight - y / k };
}
