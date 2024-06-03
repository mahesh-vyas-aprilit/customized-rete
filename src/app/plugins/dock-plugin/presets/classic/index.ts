import { BaseSchemes } from 'rete';
import { AreaPlugin } from 'rete-area-plugin';

import { Preset } from '../types';

// function getGradient(size: number) {
//   return `linear-gradient(
//       0deg,
//       white 0%,
//       white ${size * 0.6}px,
//       rgba(255,255,255, 0.9) ${size * 0.7}px,
//       transparent ${size}px
//     )`;
// }

// this is dock-item container with flex column
// eslint-disable-next-line max-statements
function getContainer(size: number) {
  const element = document.createElement('div');
  const { style } = element;

  style.position = 'absolute';
  style.whiteSpace = 'nowrap';
  style.boxSizing = 'border-box';
  // style.left = '0';
  // style.bottom = '0';
  // style.height = `${size}px`;
  // style.width = '25%';

  element.classList.add('dock');

  element.addEventListener('pointerdown', (e) => e.stopPropagation());
  element.addEventListener('contextmenu', (e) => e.stopPropagation());

  return element;
}

// this is dock-item list
// eslint-disable-next-line max-statements
function getNodeContainer(size: number, scale: number) {
  const element = document.createElement('div');
  const { style } = element;

  style.display = 'inline-block';
  style.transform = `scale(${scale})`;
  // style.height = `${size / scale}px`;
  // style.overflow = 'hidden';
  // style.transformOrigin = '50% 0';

  element.classList.add('dock-item');

  return element;
}

/**
 * Classic preset for the dock plugin.
 * Creates container for list of nodes and containers each node.
 * @param props Preset properties
 * @param props.size Size of a node
 * @param props.scale Scale of a node
 * @param props.area Area plugin instance
 */
export function setup<T>(props: {
  size?: number;
  scale?: number;
  area: AreaPlugin<BaseSchemes, T>;
}): Preset {
  const size = typeof props.size === 'undefined' ? 100 : props.size;
  const scale = typeof props.scale === 'undefined' ? 0.7 : props.scale;
  const container = getContainer(size);

  props.area.container.appendChild(container);

  return {
    createItem(index) {
      const element = getNodeContainer(size, scale);

      const beforeChild =
        typeof index !== 'undefined' ? container.children[index] : null;

      container.insertBefore(element, beforeChild);

      return element;
    },
    removeItem(element) {
      container.removeChild(element);
    },
  };
}
