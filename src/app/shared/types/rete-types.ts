import type { GetSchemes, NodeEditor } from 'rete';
import type { Connection } from '../components/customization/labeled-connections';
import type { EndNode, MyNode, StartingNode } from '../utils/nodes';
import type { Area2D, AreaPlugin } from 'rete-area-plugin';
import type { AngularArea2D } from 'rete-angular-plugin';
import type { ContextMenuExtra } from 'rete-context-menu-plugin';
import type { MinimapExtra } from 'rete-minimap-plugin';
import type { RerouteExtra } from 'rete-connection-reroute-plugin';
import type { DataflowEngine } from 'rete-engine';
import type { IStep } from '.';

export type INode = MyNode | StartingNode | EndNode;

export type IConnection =
  | Connection<StartingNode, MyNode>
  | Connection<StartingNode, EndNode>
  | Connection<MyNode, MyNode>
  | Connection<MyNode, EndNode>;

export type ISchemes = GetSchemes<INode, IConnection>;

export type IAreaExtra =
  | Area2D<ISchemes>
  | AngularArea2D<ISchemes>
  | ContextMenuExtra
  | MinimapExtra
  | RerouteExtra;

export type IContext = {
  process: () => void;
  editor: NodeEditor<ISchemes>;
  area: AreaPlugin<ISchemes, any>;
  dataflow: DataflowEngine<ISchemes>;
};

export type IReteOutput = {
  layout: (animate: boolean) => Promise<void>;
  saveModule: () => IStep[];
  editor: NodeEditor<ISchemes>;
  area: AreaPlugin<ISchemes, IAreaExtra>;
  destroy: () => void;
};

export type ILabelPosition = 'start' | 'center' | 'end';
export type ILabel = { text: string; position?: ILabelPosition };
