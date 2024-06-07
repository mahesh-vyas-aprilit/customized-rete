import type { IPosition, ISize } from '../../types';

/**
 * Calculates the inner radius of an element based on its size.
 *
 * @param {ISize} size - The size object containing the width and height of the element.
 * @returns {number} The inner radius of the element.
 */
export function getInnerRadius(size: ISize): number {
  const width = size.width;
  const height = size.height;
  const minLength = Math.min(width, height);

  return minLength / 2;
}

/**
 * Checks if a rectangular element intersects with an SVG path element.
 *
 * @param {IPosition & ISize} rect - The position and size object of the rectangular element.
 * @param {SVGPathElement} pathElement - The SVG path element to check for intersection.
 * @param {number} [accuracy=1] - The accuracy of the intersection check (higher values for more accuracy).
 * @returns {boolean} True if the rectangular element intersects with the SVG path element, false otherwise.
 */
export function checkElementIntersectPath(
  rect: IPosition & ISize,
  pathElement: SVGPathElement,
  accuracy: number = 1
): boolean {
  const pathLength = pathElement.getTotalLength();
  const innerRectRadius = getInnerRadius(rect);
  const step = Math.max(pathLength / 100, innerRectRadius / accuracy);
  const pathRect = pathElement.getBBox();

  if (
    rect.x + rect.width < pathRect.x ||
    rect.x > pathRect.x + pathRect.width ||
    rect.y + rect.height < pathRect.y ||
    rect.y > pathRect.y + pathRect.height
  ) {
    return false;
  }

  for (let i = 0; i < pathLength; i += step) {
    const point = pathElement.getPointAtLength(i);

    if (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    ) {
      return true;
    }
  }

  return false;
}
