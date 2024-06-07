import { BaseSchemes, NodeEditor } from 'rete';
import { AreaExtensions, AreaPlugin } from 'rete-area-plugin';

/**
 * Sets up the viewport bound for the area and restricts node movement within the viewport.
 *
 * @template S - The base schemes type.
 * @template K - The additional area properties type.
 * @param {AreaPlugin<S, K>} area - The area plugin instance.
 */
export function setupViewportBound<S extends BaseSchemes, K>(
  area: AreaPlugin<S, K>
) {
  const editor = area.parentScope<NodeEditor<S>>(NodeEditor);

  // Set up the viewport restrictions for scaling and translation
  AreaExtensions.restrictor(area, {
    scaling: () => {
      const bbox = AreaExtensions.getBoundingBox(area, editor.getNodes());
      const viewport = getViewportSize(area);
      const dx = viewport.width / bbox.width;
      const dy = viewport.height / bbox.height;

      // Adjust scaling to ensure better zooming capabilities
      const maxScale = Math.min(dx, dy);

      return { min: 0.1, max: maxScale > 1 ? maxScale : 1 };
    },
    translation: () => {
      const k = area.area.transform.k;
      const bbox = AreaExtensions.getBoundingBox(area, editor.getNodes());
      const viewport = getViewportSize(area);

      const horizontal = [-bbox.left * k, viewport.width - bbox.right * k];

      return {
        left: Math.min(...horizontal),
        top: -Infinity, // Allow unlimited vertical scrolling
        right: Math.max(...horizontal),
        bottom: Infinity, // Allow unlimited vertical scrolling
      };
    },
  });

  // Set up node movement restrictions
  nodeRestrictor(area);
}

/**
 * Returns the viewport size based on the area container dimensions.
 *
 * @template S - The base schemes type.
 * @template K - The additional area properties type.
 * @param {AreaPlugin<S, K>} area - The area plugin instance.
 * @returns {{width: number, height: number}} The viewport size object.
 */
const getViewportSize = <S extends BaseSchemes, K>(
  area: AreaPlugin<S, K>
): { width: number; height: number } => ({
  width: area.container.clientWidth,
  height: area.container.clientHeight,
});

/**
 * Restricts node movement within the viewport bounds.
 *
 * @template S - The base schemes type.
 * @template K - The additional area properties type.
 * @param {AreaPlugin<S, K>} area - The area plugin instance.
 */
function nodeRestrictor<S extends BaseSchemes, K>(area: AreaPlugin<S, K>) {
  area.addPipe((context) => {
    if (!context || typeof context !== 'object' || !('type' in context))
      return context;
    if (context.type === 'nodetranslate') {
      const view = area.nodeViews.get(context.data.id);

      if (view) {
        const { x, y, k } = area.area.transform;
        const rect = view.element.getBoundingClientRect();
        const viewport = getViewportSize(area);
        const left = -x / k;
        const right = (viewport.width - x - rect.width) / k;

        return {
          ...context,
          data: {
            ...context.data,
            position: {
              x: Math.min(Math.max(left, context.data.position.x), right),
              y: context.data.position.y, // Allow unlimited vertical movement
            },
          },
        };
      }
    }
    return context;
  });
}
