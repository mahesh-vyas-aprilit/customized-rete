import { Conn, Context, Node } from '../rete';
import { IActionTemplate, IStep } from '../types';

export function exportEditor(context: Context) {
  const nodes: IStep[] = [];
  const connections: Conn[] = [];

  for (const n of context.editor.getNodes() as Node[]) {
    // nodes.push({
    //   id: n.id,
    //   name: n.label,
    //   data: n.stepData,
    // });
    const position = context.area.nodeViews.get(n.id)?.position;
    // const updatedNode = { ...n.stepData, position };
    nodes.push({
      ...n.stepData,
      // @ts-ignore
      id: n.id,
      // @ts-ignore
      stepId: n.id,
      position,
      workflowStepActionTemplates: [],
    });
  }

  for (const c of context.editor.getConnections()) {
    connections.push({
      id: c.id,
      source: c.source,
      sourceOutput: c.sourceOutput,
      target: c.target,
      targetInput: c.targetInput,
      // new data
      label: c.label,
      labelColor: c.labelColor,
      labelIcon: c.labelIcon,
    });
  }

  nodes.map((node) => {
    connections.map((connection) => {
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
            label: connection.label?.text!,
            code: 'approve',
            direction: 'next',
            color: connection.labelColor!,
            icon: connection.labelIcon!,
          },
        };
        node.workflowStepActionTemplates.push(action);
      }
    });
  });

  return nodes;
}
