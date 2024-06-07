import type { IActionTemplate, IStep } from '../types';
import type { IConnection, IContext, INode } from '../types/rete-types';

/**
 * Exports the editor's current state to an array of IStep objects.
 * @param {IContext} context - The context containing the editor instance.
 * @returns {IStep[]} - The exported steps.
 */
export function exportEditor(context: IContext): IStep[] {
  const nodes: IStep[] = [];
  const connections: IConnection[] = [];

  // Collect nodes with their position and initialize empty workflowStepActionTemplates
  context.editor.getNodes().forEach((node: INode) => {
    const position = context.area.nodeViews.get(node.id)?.position;
    nodes.push({
      ...node.stepData,
      // @ts-ignore
      id: node.id,
      // @ts-ignore
      stepId: node.id,
      position,
      workflowStepActionTemplates: [],
    });
  });

  // Collect connections
  context.editor.getConnections().forEach((connection: IConnection) => {
    connections.push({
      id: connection.id,
      source: connection.source,
      sourceOutput: connection.sourceOutput,
      target: connection.target,
      targetInput: connection.targetInput,
      // new data
      label: connection.label,
      labelColor: connection.labelColor,
      labelIcon: connection.labelIcon,
    });
  });

  // Associate connections with the corresponding nodes
  nodes.forEach((node) => {
    connections.forEach((connection) => {
      if (String(connection.source) === String(node.stepId)) {
        const action: IActionTemplate = {
          id: connection.id,
          workflowId: 1,
          // @ts-ignore
          stepId: connection.target,
          actionTypeId: 1,
          isJustificationRequired: false,
          isActive: true,
          actionType: {
            id: String(connection.id),
            name: 'Approve',
            label: connection.label?.text || '',
            code: 'approve',
            direction: 'next',
            color: connection.labelColor || '',
            icon: connection.labelIcon || '',
          },
        };
        node.workflowStepActionTemplates.push(action);
      }
    });
  });

  return nodes;
}
