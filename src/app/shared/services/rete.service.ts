import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { InterleavedBuffer } from 'three';

export interface ReteEvent {
  type: 'nodeAdded' | 'nodeDeleted' | 'nodeDragged';
  data: any;
}
@Injectable({ providedIn: 'root' })
export class ReteService {
  chartUpdate = new Subject<ReteEvent>();
  constructor() {}
  triggerEvent(event: ReteEvent) {
    this.chartUpdate.next(event);
  }
  // chartUpdate = new BehaviorSubject<ReteEvent>(null)
}
