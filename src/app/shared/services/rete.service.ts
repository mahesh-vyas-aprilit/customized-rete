import { Injectable, Injector, OnChanges, SimpleChanges } from '@angular/core';
import { NodeEditor } from 'rete';
import { Subject } from 'rxjs';
import { IAreaExtra, INode, ISchemes } from '../types/rete-types';
import { AreaPlugin } from 'rete-area-plugin';
import { IPosition, IReteSettings, IStep } from '../types';
import { createEditor } from '../rete';

/**
 * Represents an event object emitted by the ReteService.
 *
 * @interface ReteEvent
 * @property {('nodeAdded' | 'nodeDeleted' | 'nodeDragged' | 'nodeAddedWithClick' | 'nodeAddedWithDragAndDrop')} type - The type of the event.
 * @property {any} data - The data associated with the event.
 */
export interface ReteEvent {
  type:
    | 'nodeAdded'
    | 'nodeDeleted'
    | 'nodeDragged'
    | 'nodeAddedWithClick'
    | 'nodeAddedWithDragAndDrop';
  data: any;
}

/**
 * A service that provides a subject for emitting and subscribing to Rete events.
 *
 * @class ReteService
 */
@Injectable({ providedIn: 'root' })
export class ReteService implements OnChanges {
  /**
   * A Subject that emits ReteEvent objects.
   *
   * @member {Subject<ReteEvent>}
   */
  chartUpdate = new Subject<ReteEvent>();
  reteEditor!: NodeEditor<ISchemes>;
  reteArea!: AreaPlugin<ISchemes, IAreaExtra>;
  current?: () => INode;

  constructor(private injector: Injector) {}
  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  /**
   * Triggers an event by emitting it through the chartUpdate Subject.
   *
   * @param {ReteEvent} event - The event object to be emitted.
   */
  triggerEvent(event: ReteEvent) {
    this.chartUpdate.next(event);
  }

  async createReteEditor(
    container: HTMLElement,
    settings: IReteSettings,
    apiNodes: IStep[]
  ) {
    const { editor, area, saveModule } = await createEditor(
      container,
      this.injector,
      settings,
      apiNodes
    );

    this.reteEditor = editor;
    this.reteArea = area;

    return { editor, area, saveModule };
  }

  /**
   * Handles the chart update events by delegating to specific handlers.
   *
   * @param {ReteEvent} event - The event object to be handled.
   */
  async handleChartUpdate(event: ReteEvent) {
    switch (event.type) {
      case 'nodeAdded':
        await this.handleNodeAdded(event.data);
        break;
      case 'nodeDeleted':
        await this.handleNodeDeleted(event.data);
        break;
      case 'nodeAddedWithClick':
        await this.handleNodeAddedWithClick(event.data);
        break;
      case 'nodeAddedWithDragAndDrop':
        const { node, position } = event.data;
        await this.handleAddNodeWithDragAndDrop(node, position);
        break;
      default:
        break;
    }
  }

  async handleAddNodeWithDragAndDrop(node: INode, position: IPosition) {
    await this.reteEditor.addNode(node);
    const view = this.reteArea.nodeViews.get(node.id);
    if (!view) throw new Error('view');
    await view.translate(position.x, position.y);
  }

  /**
   * Handles the event for adding a node.
   *
   * @param {any} data - The data associated with the event.
   */
  async handleNodeAdded(data: any) {
    await this.reteEditor.addNode(data);
  }

  /**
   * Handles the event for deleting a node.
   *
   * @param {any} data - The data associated with the event.
   */
  async handleNodeDeleted(data: any) {
    const connections = this.reteEditor.getConnections().filter((c) => {
      return c.source === data || c.target === data;
    });
    for (const connection of connections) {
      await this.reteEditor.removeConnection(connection.id);
    }
    await this.reteEditor.removeNode(data);
  }

  /**
   * Handles the event for adding a node with a click.
   *
   * @param {any} data - The data associated with the event.
   */
  async handleNodeAddedWithClick(data: any) {
    await this.reteEditor.addNode(data);
    // const viewportCenter = getViewportCenter(this.reteArea);
    // const view = this.reteArea.nodeViews.get(data.id);
    // if (!view) throw new Error('view');
    // await view?.translate(viewportCenter.x, viewportCenter.y);
  }
}
