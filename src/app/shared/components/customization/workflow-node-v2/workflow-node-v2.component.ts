import {
  Component,
  Input,
  HostBinding,
  ChangeDetectorRef,
  OnChanges,
} from '@angular/core';
import { EndNode, MyNode, StartingNode } from '../../../utils/nodes';
import { ReteService } from 'src/app/shared/services/rete.service';

@Component({
  templateUrl: './workflow-node-v2.component.html',
  styleUrls: ['./workflow-node-v2.component.scss'],
  host: {
    'data-testid': 'node',
  },
})
export class WorkflowNodeV2Component implements OnChanges {
  @Input() data!: MyNode | StartingNode | EndNode;
  @Input() emit!: (data: any) => void;
  @Input() rendered!: () => void;
  // dynamicBgColor: string = '';
  seed = 0;

  @HostBinding('class.selected') get selected() {
    return this.data.selected;
  }

  @HostBinding('class.group/node-main') get group() {
    return true;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private reteService: ReteService
  ) {
    this.cdr.detach();
  }

  ngOnChanges(): void {
    // this.dynamicBgColor = this.data.bgColor || '';
    this.cdr.detectChanges();
    requestAnimationFrame(() => this.rendered());
    this.seed++; // force render sockets
  }

  handleNodeDelete(nodeId: string) {
    this.reteService.triggerEvent({ type: 'nodeAdded', data: nodeId });
  }

  sortByIndex(a: any, b: any) {
    const ai = a.value.index || 0;
    const bi = b.value.index || 0;

    return ai - bi;
  }
}
