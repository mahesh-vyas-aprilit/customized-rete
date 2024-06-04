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
import { ArrangeAppliers, AutoArrangePlugin } from 'rete-auto-arrange-plugin';
import { getDOMSocketPosition } from 'rete-render-utils';
import {
  ConnectionPathPlugin,
  Transformers,
} from 'rete-connection-path-plugin';
import { Injector } from '@angular/core';
import { ContextMenuExtra } from 'rete-context-menu-plugin';
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
import { ReadonlyPlugin } from 'rete-readonly-plugin';
import { IReteSettings, IStep } from './types';
import { curveStepAfter } from 'd3-shape';
import { easeInOut } from 'popmotion';
// import { DockPlugin, DockPresets } from 'rete-dock-plugin';
import { DockPlugin, DockPresets } from 'src/app/plugins/dock-plugin-v2';
import { insertableNodes } from './plugins/insert-node';

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
export type Schemes = GetSchemes<Node, Conn>;

export type AreaExtra =
  | Area2D<Schemes>
  | AngularArea2D<Schemes>
  | ContextMenuExtra
  | MinimapExtra
  | RerouteExtra;

export const editor = new NodeEditor<Schemes>();

export let area: AreaPlugin<Schemes, AreaExtra>;

export async function createEditor(
  container: HTMLElement,
  injector: Injector,
  settings: IReteSettings,
  apiNodes: IStep[]
) {
  area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const angularRender = new AngularPlugin<Schemes, AreaExtra>({ injector });
  const readonly = new ReadonlyPlugin<Schemes>();
  const reroutePlugin = new ReroutePlugin<Schemes>();
  const dock = new DockPlugin<Schemes>();

  editor.use(readonly.root);
  editor.use(area);
  area.use(readonly.area);
  area.use(angularRender);
  if (!settings.isReadOnly) {
    area.use(connection);
  }

  if (settings.isMiniMap) {
    const minimap = new MinimapPlugin<Schemes>();
    area.use(minimap);
  }

  const animatedInsertNodeApplier = new ArrangeAppliers.TransitionApplier<
    Schemes,
    never
  >({
    duration: 500,
    timingFunction: easeInOut,
  });

  const animatedApplier = new ArrangeAppliers.TransitionApplier<Schemes, never>(
    {
      duration: 500,
      timingFunction: (t) => t,
      async onTick() {
        await AreaExtensions.zoomAt(area, editor.getNodes());
      },
    }
  );

  angularRender.use(reroutePlugin);
  dock.addPreset(DockPresets.classic.setup({ area, size: 100, scale: 0.8 }));
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
            y: position.y + 12 * (side === 'input' ? -0.1 : 0),
          };
        },
      }),
      customize: {
        node() {
          return WorkflowNodeComponent;
        },
        connection() {
          return LabeledConnectionComponent;
        },
        socket() {
          return CustomSocketComponent;
        },
      },
    })
  );

  const path: any = new ConnectionPathPlugin({
    transformer: () => Transformers.classic({ vertical: true }),
    curve: () => curveStepAfter,
    arrow: (c) => ({
      color: '#8A99B0',
      marker: 'M-5,-10 L-5,10 L15,0 z',
    }),
  });

  angularRender.use(path);

  area.use(dock);

  const dataflow = new DataflowEngine<Schemes>();

  editor.use(dataflow);

  const nodeMap = new Map<number, Node>();

  for (const step of apiNodes) {
    let nodeData;

    if (step.isFirstStep) {
      nodeData = new StartingNode(
        step.stepName,
        step.icon,
        step.color,
        step.description
      );
      dock.add(
        () =>
          new StartingNode(
            step.stepName,
            step.icon,
            step.color,
            step.description
          ),
        step.stepName,
        step.icon
      );
    } else if (step.isFinalStep) {
      nodeData = new EndNode(
        step.stepName,
        step.icon,
        step.color,
        step.description
      );
      dock.add(
        () =>
          new EndNode(step.stepName, step.icon, step.color, step.description),
        step.stepName,
        step.icon
      );
    } else {
      nodeData = new MyNode(
        step.stepName,
        step.icon,
        step.color,
        step.description
      );
      dock.add(
        () =>
          new MyNode(step.stepName, step.icon, step.color, step.description),
        step.stepName,
        step.icon
      );
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

  // const exportData: any = { nodes: [] };
  // const nodesData = editor.getNodes();

  // for (const node of nodesData) {
  //   // data.nodes.push({
  //   //   id: node.id,
  //   //   label: node.label,
  //   //   inputs: /// ....
  //   //   controls: /// ....
  //   //   outputs: /// ....
  //   // })
  //   exportData.nodes.push({
  //     id: node.id,
  //     d: node.
  //   });
  // }

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
        'elk.spacing.nodeNode': '300',
        'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      },
      applier: settings.shouldAnimate ? animatedApplier : undefined,
    })
  );

  AreaExtensions.zoomAt(area, editor.getNodes());

  AreaExtensions.simpleNodesOrder(area);

  insertableNodes(area, {
    async createConnections(node, connection) {
      await editor.addConnection(
        new Connection(
          editor.getNode(connection.source),
          connection.sourceOutput,
          node,
          'value'
        )
      );
      await editor.addConnection(
        new Connection(
          node,
          'value',
          editor.getNode(connection.target),
          connection.targetInput
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

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  async function process() {
    dataflow.reset();

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

  if (settings.isReadOnly) {
    readonly.enable();
  } else {
    readonly.disable();
  }

  return {
    layout: async (animate: boolean) => {
      await arrange.layout({ applier: animate ? animatedApplier : undefined });
      AreaExtensions.zoomAt(area, editor.getNodes());
    },
    destroy: () => {
      area.destroy();
    },
  };
}
