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
import { EndNode, MyNode, StartingNode } from '../utils/nodes';
import { WorkflowNodeComponent } from '../components/customization/workflow-node/workflow-node.component';
import { CustomSocketComponent } from '../components/customization/custom-socket/custom-socket.component';
import {
  LabeledConnectionComponent,
  Connection,
} from '../components/customization/labeled-connections';
import { ReadonlyPlugin } from 'rete-readonly-plugin';
import { IReteSettings, IStep } from '../types';
import { curveStepAfter } from 'd3-shape';
import { easeInOut } from 'popmotion';
import { insertableNodes } from '../plugins/insert-node';
import { setupViewportBound } from '../plugins/viewport-bound';
import { exportEditor } from '../utils/import-export-nodes';

export type Node = MyNode | StartingNode | EndNode;
export type Conn =
  | Connection<StartingNode, MyNode>
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

export type Context = {
  process: () => void;
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, any>;
  dataflow: DataflowEngine<Schemes>;
};

export async function createEditor(
  container: HTMLElement,
  injector: Injector,
  settings: IReteSettings,
  apiNodes: IStep[]
) {
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const angularRender = new AngularPlugin<Schemes, AreaExtra>({ injector });
  const readonly = new ReadonlyPlugin<Schemes>();
  const reroutePlugin = new ReroutePlugin<Schemes>();
  const editor = new NodeEditor<Schemes>();
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

  const dataflow = new DataflowEngine<Schemes>();

  editor.use(dataflow);

  const nodeMap = new Map<number, Node>();

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
        'elk.spacing.nodeNode': '300',
        'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      },
      applier: settings.shouldAnimate ? animatedApplier : undefined,
    })
  );
  const context: Context = {
    process,
    editor,
    area,
    dataflow,
  };

  AreaExtensions.zoomAt(area, editor.getNodes());

  setupViewportBound(area);

  AreaExtensions.simpleNodesOrder(area);

  insertableNodes(area, {
    async createConnections(node, connection) {
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
    saveModule: () => {
      return exportEditor(context);
    },
    editor,
    area,
    destroy: () => {
      area.destroy();
    },
  };
}