import { GetSchemes, NodeEditor } from 'rete';

import { Area2D, AreaExtensions, AreaPlugin } from 'rete-area-plugin';
import {
  ClassicFlow,
  ConnectionPlugin,
  Presets as ConnectionPresets,
  getSourceTarget,
} from 'rete-connection-plugin';
import {
  AngularPlugin,
  AngularArea2D,
  Presets as AngularPresets,
} from 'rete-angular-plugin/16';

import { DataflowEngine } from 'rete-engine';
import { AutoArrangePlugin } from 'rete-auto-arrange-plugin';
import { getDOMSocketPosition } from 'rete-render-utils';
import {
  ConnectionPathPlugin,
  Transformers,
} from 'rete-connection-path-plugin';
import { Injector } from '@angular/core';
import { addCustomBackground } from './customization/custom-background';
import {
  ContextMenuExtra,
  ContextMenuPlugin,
  Presets as ContextMenuPresets,
} from 'rete-context-menu-plugin';
import { MinimapExtra, MinimapPlugin } from 'rete-minimap-plugin';
import { RerouteExtra, ReroutePlugin } from 'rete-connection-reroute-plugin';
import {
  AddNode,
  EndNode,
  MyNode,
  NumberNode,
  StartingNode,
} from './customization/nodes';
import { WorkflowNodeComponent } from './customization/workflow-node/workflow-node.component';
import { CustomSocketComponent } from './customization/custom-socket/custom-socket.component';
import {
  LabeledConnectionComponent,
  Connection,
} from './customization/labeled-connections';
import { IStep } from './types';

export type Node = NumberNode | AddNode | MyNode | StartingNode | EndNode;
type Conn =
  | Connection<NumberNode, AddNode>
  | Connection<AddNode, AddNode>
  | Connection<AddNode, NumberNode>
  | Connection<MyNode, MyNode>
  | Connection<StartingNode, MyNode>
  | Connection<StartingNode, AddNode>
  | Connection<StartingNode, NumberNode>
  | Connection<StartingNode, EndNode>
  | Connection<MyNode, MyNode>
  | Connection<MyNode, EndNode>;
type Schemes = GetSchemes<Node, Conn>;

// class Connection<A extends Node, B extends Node> extends Classic.Connection<
//   A,
//   B
// > {}

type AreaExtra =
  | Area2D<Schemes>
  | AngularArea2D<Schemes>
  | ContextMenuExtra
  | MinimapExtra
  | RerouteExtra;

export async function createEditor(
  container: HTMLElement,
  injector: Injector,
  apiNodes: IStep[]
) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const angularRender = new AngularPlugin<Schemes, AreaExtra>({ injector });

  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ['Number', () => new NumberNode(1, process)],
      ['Add', () => new AddNode()],
    ]),
  });

  const minimap = new MinimapPlugin<Schemes>();
  const reroutePlugin = new ReroutePlugin<Schemes>();

  addCustomBackground(area);

  editor.use(area);

  area.use(angularRender);

  area.use(connection);
  area.use(contextMenu);
  area.use(minimap);

  angularRender.use(reroutePlugin);

  connection.addPreset(ConnectionPresets.classic.setup());
  angularRender.addPreset(AngularPresets.contextMenu.setup());
  angularRender.addPreset(AngularPresets.minimap.setup());
  connection.addPreset(
    () =>
      new ClassicFlow({
        makeConnection(from, to, context) {
          const [source, target] = getSourceTarget(from, to) || [null, null];
          const { editor } = context;

          if (source && target) {
            editor.addConnection(
              new Connection(
                editor.getNode(source.nodeId),
                source.key,
                editor.getNode(target.nodeId),
                target.key,
                {
                  label: { text: 'Start', position: 'center' },
                }
              )
            );
            return true;
          } else {
            return false;
          }
        },
      })
  );
  angularRender.addPreset(
    AngularPresets.classic.setup({
      socketPositionWatcher: getDOMSocketPosition({
        offset: (position, nodeId, side) => {
          return {
            x: position.x,
            y: position.y + 12 * (side === 'input' ? -1 : 1),
          };
        },
      }),
      customize: {
        node() {
          return WorkflowNodeComponent;
        },
        connection() {
          // return CustomConnectionComponent;
          return LabeledConnectionComponent;
        },
        socket() {
          return CustomSocketComponent;
        },
      },
    })
  );

  const path = new ConnectionPathPlugin({
    transformer: () => Transformers.classic({ vertical: true }),
    arrow: (c) => ({
      color: 'rgb(158, 159, 183)',
      marker: 'M-5,-10 L-5,10 L20,0 z',
    }),

    // curve: () => curveStepAfter,
    // curve: () => curveStepBefore,
    // curve: () => curveMonotoneY,
    // curve: () => curveBumpY,
  });

  angularRender.use(path);

  const dataflow = new DataflowEngine<Schemes>();

  editor.use(dataflow);

  const nodeMap = new Map<number, Node>();

  for (const step of apiNodes) {
    let nodeData;

    if (step.isFirstStep) {
      nodeData = new StartingNode(step.stepName);
    } else if (step.isFinalStep) {
      nodeData = new EndNode(step.stepName);
    } else {
      nodeData = new MyNode(step.stepName, 'book');
    }

    nodeData.id = String(step.stepId);
    await editor.addNode(nodeData);

    nodeMap.set(step.stepId, nodeData);
  }
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

  const arrange = new AutoArrangePlugin<Schemes>();

  arrange.addPreset(() => {
    return {
      port(data) {
        const spacing = data.height / (data.ports + 1);

        return {
          x: 0,
          y: spacing * (data.index + 1),
          width: 20,
          height: 20,
          side: data.side === 'output' ? 'SOUTH' : 'NORTH',
        };
      },
    };
  });

  area.use(arrange);

  console.log(
    await arrange.layout({
      options: {
        'org.eclipse.elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '200',
        'elk.layered.spacing.nodeNodeBetweenLayers': '50',
      },
    })
  );

  AreaExtensions.zoomAt(area, editor.getNodes());

  AreaExtensions.simpleNodesOrder(area);

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  async function process() {
    dataflow.reset();

    // const sum = await dataflow.fetch(add.id);

    // console.log(add.id, 'produces', sum);

    // area.update(
    //   'control',
    //   (add.controls['result'] as Classic.InputControl<'number'>).id
    // );

    area.update('control', 'result');
  }
  await process();

  editor.addPipe((context) => {
    if (
      context.type === 'connectioncreated' ||
      context.type === 'connectionremoved'
    ) {
      process();
    }
    return context;
  });

  return {
    destroy: () => {
      area.destroy();
    },
  };
}