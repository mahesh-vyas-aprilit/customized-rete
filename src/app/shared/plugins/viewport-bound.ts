import { BaseSchemes, NodeEditor } from 'rete';
import { AreaExtensions, AreaPlugin } from 'rete-area-plugin';

export function setupViewportBound<S extends BaseSchemes, K>(
  area: AreaPlugin<S, K>
) {
  const editor = area.parentScope<NodeEditor<S>>(NodeEditor);

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

  nodeRestrictor(area);
}

const getViewportSize = <S extends BaseSchemes, K>(area: AreaPlugin<S, K>) => ({
  width: area.container.clientWidth,
  height: area.container.clientHeight,
});

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