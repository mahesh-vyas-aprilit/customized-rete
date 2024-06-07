import { Injectable } from '@angular/core';
import { NodeEditor } from 'rete';
import { Subject } from 'rxjs';
import { IAreaExtra, ISchemes } from '../types/rete-types';
import { AreaPlugin } from 'rete-area-plugin';

/**
 * Represents an event object emitted by the ReteService.
 *
 * @interface ReteEvent
 * @property {('nodeAdded' | 'nodeDeleted' | 'nodeDragged' | 'nodeAddedWithClick')} type - The type of the event.
 * @property {any} data - The data associated with the event.
 */
export interface ReteEvent {
  type: 'nodeAdded' | 'nodeDeleted' | 'nodeDragged' | 'nodeAddedWithClick';
  data: any;
}

/**
 * A service that provides a subject for emitting and subscribing to Rete events.
 *
 * @class ReteService
 */
@Injectable({ providedIn: 'root' })
export class ReteService {
  /**
   * A Subject that emits ReteEvent objects.
   *
   * @member {Subject<ReteEvent>}
   */
  chartUpdate = new Subject<ReteEvent>();
  reteEditor!: NodeEditor<ISchemes>;
  reteArea!: AreaPlugin<ISchemes, IAreaExtra>;

  constructor() {}

  /**
   * Triggers an event by emitting it through the chartUpdate Subject.
   *
   * @param {ReteEvent} event - The event object to be emitted.
   */
  triggerEvent(event: ReteEvent) {
    this.chartUpdate.next(event);
  }
}
