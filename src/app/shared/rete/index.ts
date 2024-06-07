import { NodeEditor } from 'rete';
import { AreaExtensions, AreaPlugin } from 'rete-area-plugin';
import {
  ClassicFlow,
  ConnectionPlugin,
  Presets as ConnectionPresets,
  getSourceTarget,
} from 'rete-connection-plugin';
import {
  AngularPlugin,
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
import { MinimapPlugin } from 'rete-minimap-plugin';
import { ReroutePlugin } from 'rete-connection-reroute-plugin';
import { WorkflowNodeComponent } from '../components/customization/workflow-node/workflow-node.component';
import { CustomSocketComponent } from '../components/customization/custom-socket/custom-socket.component';
import {
  LabeledConnectionComponent,
  Connection,
} from '../components/customization/labeled-connections';
import { ReadonlyPlugin } from 'rete-readonly-plugin';
import type { IReteSettings, IStep } from '../types';
import { curveStepAfter } from 'd3-shape';
import { setupViewportBound } from '../plugins/viewport-bound';
import { exportEditor } from '../utils/import-export-nodes';
import { nodeAndConnectionSetup } from './node-and-connection-setup';
import { registerInsertableNodes } from './register-insertable-nodes';
import type {
  IAreaExtra,
  IContext,
  IReteOutput,
  ISchemes,
} from '../types/rete-types';

export async function createEditor(
  container: HTMLElement,
  injector: Injector,
  settings: IReteSettings,
  apiNodes: IStep[]
): Promise<IReteOutput> {
  const area = new AreaPlugin<ISchemes, IAreaExtra>(container);
  const connection = new ConnectionPlugin<ISchemes, IAreaExtra>();
  const angularRender = new AngularPlugin<ISchemes, IAreaExtra>({ injector });
  const readonly = new ReadonlyPlugin<ISchemes>();
  const reroutePlugin = new ReroutePlugin<ISchemes>();
  const editor = new NodeEditor<ISchemes>();
  editor.use(readonly.root);
  editor.use(area);
  area.use(readonly.area);
  area.use(angularRender);

  if (!settings.isReadOnly) {
    area.use(connection);
  }

  if (settings.isMiniMap) {
    const minimap = new MinimapPlugin<ISchemes>();
    area.use(minimap);
  }

  const animatedApplier = new ArrangeAppliers.TransitionApplier<
    ISchemes,
    never
  >({
    duration: 500,
    timingFunction: (t) => t,
    async onTick() {
      await AreaExtensions.zoomAt(area, editor.getNodes());
    },
  });

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

  const dataflow = new DataflowEngine<ISchemes>();

  editor.use(dataflow);

  // Adding nodes and connection to the rete canvas.
  await nodeAndConnectionSetup(apiNodes, editor, area);

  const arrange = new AutoArrangePlugin<ISchemes>();

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

  const context: IContext = {
    process,
    editor,
    area,
    dataflow,
  };

  AreaExtensions.zoomAt(area, editor.getNodes());

  setupViewportBound(area);

  AreaExtensions.simpleNodesOrder(area);

  // creating insertable nodes
  await registerInsertableNodes(area, editor, arrange);

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
