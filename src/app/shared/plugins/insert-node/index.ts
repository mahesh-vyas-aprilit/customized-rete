import { BaseSchemes, GetSchemes, NodeEditor } from 'rete';
import { AreaPlugin } from 'rete-area-plugin';
import { checkElementIntersectPath } from './utils';
import type { IPosition, ISize } from '../../types';

type Schemes = GetSchemes<
  BaseSchemes['Node'] & ISize,
  BaseSchemes['Connection']
>;

/**
 * Checks if the provided position and size intersect with any of the given connections.
 *
 * @param {IPosition} position - The position object containing x and y coordinates.
 * @param {Object} size - The size object containing width and height.
 * @param {size.width} size.width - The width of the element.
 * @param {size.height} size.height - The height of the element.
 * @param {Array<[string, HTMLElement]>} connections - An array of connection IDs and their corresponding HTML elements.
 * @returns {false|string} Returns the ID of the intersecting connection, or false if no intersection is found.
 */
export function checkIntersection(
  position: IPosition,
  size: { width: number; height: number },
  connections: (readonly [string, HTMLElement])[]
): false | string {
  const paths = connections.map(([id, element]) => {
    const path = element.querySelector('path');

    if (!path) throw new Error('path not found');

    return [id, element, path] as const;
  });

  for (const [id, , path] of paths) {
    if (checkElementIntersectPath({ ...position, ...size }, path)) {
      return id;
    }
  }

  return false;
}

type Props<S extends Schemes> = {
  createConnections: (
    node: S['Node'],
    connection: S['Connection']
  ) => Promise<void>;
};

/**
 * Adds a pipe to the area plugin that checks for node intersection and creates connections accordingly.
 *
 * @template S
 * @param {AreaPlugin<S, any>} area - The area plugin instance.
 * @param {Props<S>} props - An object containing the createConnections function.
 */
export function insertableNodes<S extends Schemes>(
  area: AreaPlugin<S, any>,
  props: Props<S>
) {
  area.addPipe(async (context) => {
    if (context.type === 'nodedragged') {
      const editor = area.parentScope<NodeEditor<S>>(NodeEditor);
      const node = editor.getNode(context.data.id);
      const view = area.nodeViews.get(context.data.id);
      const cons = Array.from(area.connectionViews.entries()).map(
        ([id, view]) => [id, view.element] as const
      );

      if (view) {
        const id = checkIntersection(view.position, node, cons);

        if (id) {
          const exist = editor.getConnection(id);

          if (exist.source !== node.id && exist.target !== node.id) {
            await editor.removeConnection(id);
            await props.createConnections(node, exist);
          }
        }
      }
    }
    return context;
  });
}
