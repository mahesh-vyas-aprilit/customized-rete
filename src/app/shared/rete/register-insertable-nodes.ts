import { AreaPlugin } from 'rete-area-plugin';
import { insertableNodes } from '../plugins/insert-node';
import { Connection } from '../components/customization/labeled-connections';
import { NodeEditor } from 'rete';
import { ArrangeAppliers, AutoArrangePlugin } from 'rete-auto-arrange-plugin';
import { easeInOut } from 'popmotion';
import type {
  IAreaExtra,
  ISchemes,
  INode,
  IConnection,
} from '../types/rete-types';

/**
 * Registers insertable nodes in the specified area and sets up connections and layout for them.
 *
 * @async
 * @param {AreaPlugin<Schemes, AreaExtra>} area - The area plugin instance.
 * @param {NodeEditor<Schemes>} editor - The node editor instance.
 * @param {AutoArrangePlugin<Schemes>} arrange - The auto-arrange plugin instance.
 */
export async function registerInsertableNodes(
  area: AreaPlugin<ISchemes, IAreaExtra>,
  editor: NodeEditor<ISchemes>,
  arrange: AutoArrangePlugin<ISchemes>
) {
  const animatedInsertNodeApplier = new ArrangeAppliers.TransitionApplier<
    ISchemes,
    never
  >({
    duration: 500,
    timingFunction: easeInOut,
  });

  insertableNodes(area, {
    /**
     * Creates connections for the inserted node.
     *
     * @async
     * @param {INode} node - The inserted node.
     * @param {IConnection} connection - The connection object containing source, target, and label information.
     * @returns {Promise<void>} A promise that resolves when the connections are created.
     */
    async createConnections(
      node: INode,
      connection: IConnection
    ): Promise<void> {
      await editor.addConnection(
        new Connection(
          editor.getNode(connection.source),
          connection.sourceOutput,
          node,
          'value',
          {
            label: {
              text: connection.label?.text!,
              position: connection.label?.position,
            },
            labelColor: connection.labelColor,
            labelIcon: connection.labelIcon,
          }
        )
      );

      await editor.addConnection(
        new Connection(
          node,
          'value',
          editor.getNode(connection.target),
          connection.targetInput,
          {
            label: {
              text: 'Sent',
              position: 'center',
            },
            labelColor: 'green',
            labelIcon: 'check',
          }
        )
      );
      arrange.layout({
        options: {
          'org.eclipse.elk.direction': 'DOWN',
          'elk.spacing.nodeNode': '300',
          'elk.layered.spacing.nodeNodeBetweenLayers': '80',
        },
        applier: animatedInsertNodeApplier,
      });
    },
  });
}
