import { NodeEditor } from 'rete';
import { IStep } from '../types';
import { EndNode, MyNode, StartingNode } from '../utils/nodes';
import { AreaPlugin } from 'rete-area-plugin';
import { Connection } from '../components/customization/labeled-connections';
import type { IAreaExtra, ISchemes, INode } from '../types/rete-types';

/**
 * Sets up nodes and connections based on the provided API data.
 *
 * @async
 * @param {IStep[]} apiNodes - An array of step objects representing the workflow data.
 * @param {NodeEditor<Schemes>} editor - The node editor instance.
 * @param {AreaPlugin<Schemes, AreaExtra>} area - The area plugin instance.
 */
export async function nodeAndConnectionSetup(
  apiNodes: IStep[],
  editor: NodeEditor<ISchemes>,
  area: AreaPlugin<ISchemes, IAreaExtra>
) {
  const nodeMap = new Map<number, INode>();

  // Loop to create nodes and add them to the editor and nodeMap
  for (const step of apiNodes) {
    let nodeData;

    if (step.isFirstStep) {
      nodeData = new StartingNode(step);
    } else if (step.isFinalStep) {
      nodeData = new EndNode(step);
    } else {
      nodeData = new MyNode(step);
    }

    nodeData.id = String(step.stepId);

    await editor.addNode(nodeData);
    if (step.position) {
      area.translate(nodeData.id, { x: step.position.x, y: step.position.y });
    }

    nodeMap.set(step.stepId, nodeData);
  }

  // Loop to create connections between nodes
  for (const step of apiNodes) {
    const node = nodeMap.get(step.stepId);
    if (node && step.workflowStepActionTemplates.length > 0) {
      for (const action of step.workflowStepActionTemplates) {
        let targetStepId: number;

        if (action.actionType.direction == 'last') {
          targetStepId = apiNodes.at(-1)?.id!;
        } else if (action.actionType.direction == 'previous') {
          targetStepId = action.stepId - 1;
        } else {
          targetStepId = action.stepId;
        }
        const targetNode = nodeMap.get(targetStepId);

        if (targetNode) {
          await editor.addConnection(
            new Connection(node, 'value', targetNode, 'value', {
              label: { text: action.actionType.label, position: 'center' },
              labelColor: action.actionType.color,
              labelIcon: action.actionType.icon,
            })
          );
        }
      }
    }
  }
}
